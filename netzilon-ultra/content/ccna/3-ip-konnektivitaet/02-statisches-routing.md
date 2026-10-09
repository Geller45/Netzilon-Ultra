---
id: ccna-statisches-routing
bereich: CCNA
block: CCNA 3.3
kapitel: IP Connectivity
titel: Statisches Routing – Netzwerk-, Host-, Default- und Floating-Static-Routen
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 05-routing.pdf, 200_301_CCNA_v1.0_2.pdf, Routig. Verschiedene Netzwerke..md]
verweise: [ccna-routing-grundlagen, ccna-ospf, ccna-fhrp]
---

## Profi

### Syntax
`ip route <Ziel-Netz> <Maske> <Next-Hop-IP | Ausgangs-Interface> [AD]`
- **Next-Hop-IP**: empfohlen bei Ethernet (rekursive Auflösung; nur ein ARP-Ziel).
- **Interface**: bei Ethernet vermeiden (Router muss für jedes Ziel ARPen – „Proxy-ARP-Abhängigkeit“); bei Serial/Punkt-zu-Punkt ok.
- **Vollständig spezifiziert**: Interface + Next-Hop (`ip route 10.0.2.0 255.255.255.0 g0/1 10.0.1.2`) – beste Praxis bei Multi-Access.
IPv6: `ipv6 unicast-routing`, `ipv6 route 2001:db8:2::/64 2001:db8:12::2`.

### Routentypen
| Typ | Beispiel | Maske |
|---|---|---|
| **Netzwerkroute** | `ip route 192.168.2.0 255.255.255.0 10.0.0.2` | beliebig |
| **Hostroute** | `ip route 192.168.2.10 255.255.255.255 10.0.0.2` (Code S, /32) | /32 (IPv6 /128) |
| **Default-Route** | `ip route 0.0.0.0 0.0.0.0 10.0.0.2` | /0 |
| **Summary (Zusammenfassung)** | `ip route 192.168.0.0 255.255.252.0 10.0.0.2` | mehrere Netze zu einem Eintrag |
| **Floating Static** | `ip route 0.0.0.0 0.0.0.0 172.16.0.1 200` | höhere AD als die Hauptroute – wird nur bei deren Ausfall aktiv |

### Funktionsprinzip
Eine statische Route erscheint in der Tabelle nur, wenn der **Next-Hop über eine aktive Route erreichbar** ist (Interface up). Fällt das Interface aus, verschwindet die Route (Ausnahme: IP-SLA-Tracking, `ip route … track 1`, falls Gegenstelle ausfällt, Interface aber up bleibt). Bei einer Stub-Netz-Topologie genügt eine **Default-Route** auf dem Randrouter; auf dem Zentralrouter braucht man Routen zu jedem Stub-Netz.

### Beispiel (Schulaufgabe „Verschiedene Netzwerke“)
R1: 192.168.1.1/24 (LAN A), 10.0.0.1/30 zu R2. R2: 10.0.0.2/30, 192.168.2.1/24 (LAN B). Statisch: auf R1 `ip route 192.168.2.0 255.255.255.0 10.0.0.2`, auf R2 `ip route 192.168.1.0 255.255.255.0 10.0.0.1`. Hosts brauchen das passende Standardgateway. **Rückroute nicht vergessen** – ein Ping scheitert sonst auf dem Rückweg!

### Zusammenfassung (Summarization)
Netze 192.168.0.0/24 – 192.168.3.0/24 → **192.168.0.0/22**: gemeinsame Bits ermitteln (3. Oktett 00000000–00000011 → 22 Bit gleich). Spart Einträge, aber nur wenn die Netze **zusammenhängend und ausgerichtet** sind.

## Einfach

Eine **statische Route** ist wie ein Wegweiser, den du selbst aufstellst: „Wer nach Hamburg will, fahre über Onkel Peter.“ Das Schild steht immer da, egal ob Onkel Peter zu Hause ist oder nicht – nur wenn die Straße zu Onkel Peter komplett gesperrt ist (Kabel ab), nimmst du das Schild weg.

Du schreibst auf: **Wohin** (Zielnetz mit Maske) und **über wen** (die Adresse des nächsten Routers = Next-Hop). Das war's.

Wichtig ist der Hinweg **und** der Rückweg: Wenn du dem Postboten sagst, wie er zu deiner Freundin kommt, muss sie ihrem Postboten auch sagen, wie er zu dir kommt. Sonst kommt dein Brief an, aber die Antwort geht verloren – du siehst dann „Request timed out“.

Spezielle Wegweiser:
- **Default-Route**: „Alles, was ich nicht kenne – ab ins Internet.“ (0.0.0.0/0)
- **Host-Route**: Wegweiser nur zu einem einzigen Haus (/32).
- **Floating Static**: ein Ersatzschild mit schlechter Bewertung (hohe AD, z. B. 200) – wird erst wichtig, wenn das Hauptschild abgebaut wurde. Praktisch als Notweg über eine zweite Leitung.

Ein Beispiel aus dem Alltag: Dein Heimrouter hat genau eine statische Route, die du nie eingetippt hast – die Default-Route zum Provider. Alles, was nicht im Heimnetz liegt, geht dorthin. In einer Firma mit zwei Standorten schreibt der Admin dagegen für das jeweils andere Standortnetz einen eigenen Wegweiser. Bei zwei Standorten ist das schnell gemacht; bei 50 Standorten würde man irgendwann zu einem dynamischen Verfahren wie OSPF wechseln, weil die Router sich die Wegweiser dann selbst erzählen.

## Merksatz
- **`ip route Ziel Maske Next-Hop`.**
- **Hin- und Rückroute eintragen!**
- **Default = 0.0.0.0 0.0.0.0, Host = /32.**
- **Floating Static: AD höher als die Hauptroute.**
- **Ethernet: Next-Hop-IP statt nur Interface.**

## Prüfungsfalle
- Der Next-Hop muss im **Netz des eigenen Interfaces** liegen (nicht die eigene Interface-IP!).
- **Maske ≠ Wildcard**: Bei `ip route` kommt die normale Subnetzmaske, bei OSPF/ACL die Wildcard.
- Floating Static mit AD **kleiner** als die Hauptroute wird zur Hauptroute.
- Eine statische Route mit nicht erreichbarem Next-Hop wird **nicht** installiert.
- Zusammenfassungen können fremde Netze mit einschließen (zu große Summary).
- Hostroute (/32) schlägt jede kürzere Route (Longest Prefix).

## Grafik
### Statische Route und Rückweg
1. PC1 -> R1: Ping 192.168.2.10
2. R1: Eintrag S 192.168.2.0/24 via 10.0.0.2
3. R1 -> R2: weitergeleitet
4. R2 -> PC2: Zustellung (C-Netz)
5. PC2 -> R2: Antwort
6. R2: Eintrag S 192.168.1.0/24 via 10.0.0.1 – ohne ihn: Timeout

### Floating Static
1. Text: Hauptroute 0.0.0.0/0 via ISP1 (AD 1)
2. Text: Backup 0.0.0.0/0 via ISP2 (AD 200) – steht nicht in der Tabelle
3. R1: Link zu ISP1 fällt aus – Hauptroute verschwindet
4. R1 -> ISP2: Backup-Route wird installiert, Verkehr läuft weiter

## Lab
**Packet Tracer: PC1 – R1 – R2 – PC2 (wie Routing-Grundlagen)**

### Cisco IOS
```
R1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
R2(config)# ip route 192.168.1.0 255.255.255.0 10.0.0.1
R1# show ip route static
R1# ping 192.168.2.10
R1(config)# ip route 0.0.0.0 0.0.0.0 10.0.0.2
R1(config)# ip route 0.0.0.0 0.0.0.0 172.16.0.1 200
R1(config)# ip route 192.168.2.10 255.255.255.255 10.0.0.2
```
1. Ping PC1→PC2 testen (Hin- und Rückroute!).
2. Rückroute löschen (`no ip route …`), Ping erneut: Timeout – erklären.
3. Floating Static: R1 g0/1 `shutdown` → Backup erscheint in `show ip route`.
4. Windows (PC): `route add 192.168.2.0 mask 255.255.255.0 192.168.1.1 -p`.

## Befehle
- `ip route <net> <mask> <next-hop>` – statische Route
- `ip route 0.0.0.0 0.0.0.0 <next-hop>` – Default
- `ip route … 200` – Floating Static (AD 200)
- `show ip route static` – nur S-Routen
- `no ip route <net> <mask> <next-hop>` – löschen
- `ipv6 route <prefix> <next-hop>` – IPv6 statisch

## Übungen
- A: R1 (g0/1 10.0.0.1/30) → R2 (10.0.0.2/30, LAN 192.168.2.0/24). Route auf R1? | L: ip route 192.168.2.0 255.255.255.0 10.0.0.2
- A: Backup-Default über 172.16.0.1, nur bei Ausfall. | L: ip route 0.0.0.0 0.0.0.0 172.16.0.1 200
- A: Fassen Sie 192.168.4.0/24 bis 192.168.7.0/24 zusammen. | L: 192.168.4.0/22 (255.255.252.0).
- A: Host 10.1.1.5 genau über 10.0.0.9 erreichen. | L: ip route 10.1.1.5 255.255.255.255 10.0.0.9
- A: Ping geht hin, Antwort kommt nicht. Ursache? | L: Rückroute auf dem Zielnetz-Router fehlt.
- A: Welche AD hat eine statische Route standardmäßig? | L: 1.

## Karteikarten
- F: Syntax einer statischen Route? | A: ip route Ziel-Netz Maske Next-Hop
- F: Was ist eine Floating Static Route? | A: Backup-Route mit höherer AD, wird nur bei Ausfall der Hauptroute aktiv.
- F: Default-Route Syntax? | A: ip route 0.0.0.0 0.0.0.0 Next-Hop
- F: Hostroute – Maske? | A: 255.255.255.255 (/32).
- F: Statische Route Standard-AD? | A: 1.
- F: Warum Next-Hop statt Interface bei Ethernet? | A: Sonst ARP für jedes Ziel im Segment (Proxy-ARP-Abhängigkeit).
- F: Wann wird eine statische Route installiert? | A: Wenn der Next-Hop über eine aktive Route erreichbar ist.
- F: Was ist Route Summarization? | A: Mehrere Netze zu einer Route zusammenfassen.
- F: IPv6-Routing aktivieren? | A: ipv6 unicast-routing
- F: Typischer Fehler bei statischen Routen? | A: Rückroute fehlt.

## Quiz
? Welche Route hat die höchste Priorität bei gleichem Präfix?
* Statisch mit AD 1
- OSPF AD 110
- RIP AD 120
- Floating Static AD 200
? Wie wird eine Hostroute erkannt?
* Maske /32
- Maske /0
- Maske /24
- Maske /16
? Eine Floating-Static-Route ist…
* eine Backup-Route mit hoher AD
- eine Route ohne Next-Hop
- eine Route nur für IPv6
- ein Eintrag im ARP-Cache
? Ping erreicht das Ziel, Antwort fehlt. Wahrscheinlichste Ursache?
* Rückroute fehlt
- Falsche Subnetzmaske am PC1
- DHCP defekt
- NTP falsch
? Welcher Befehl setzt die Default-Route?
* ip route 0.0.0.0 0.0.0.0 10.0.0.2
- ip default 10.0.0.2
- ip gateway 10.0.0.2
- route default 10.0.0.2
? Was ergibt die Zusammenfassung 192.168.0.0/24–192.168.3.0/24?
* 192.168.0.0/22
- 192.168.0.0/23
- 192.168.0.0/21
- 192.168.0.0/24
? Welcher Fehler: ip route 10.2.0.0 255.255.255.0 10.0.0.1 (eigene IP)?
* Next-Hop ist die eigene Adresse
- Maske falsch
- AD falsch
- Syntax korrekt
? Warum Interface+Next-Hop bei Multi-Access?
* Vermeidet ARP-Last und mehrdeutige Auflösung
- Spart Bandbreite im WAN
- Erhöht die AD
- Verschlüsselt die Route
? Statische Route erscheint nicht in der Tabelle. Mögliche Ursache?
* Next-Hop nicht erreichbar
- AD zu niedrig
- Maske zu kurz
- Hostname fehlt
