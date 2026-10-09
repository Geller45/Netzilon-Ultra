---
id: ccna-fhrp
bereich: CCNA
block: CCNA 3.5
kapitel: IP Connectivity
titel: First-Hop-Redundanz – HSRP, VRRP, GLBP
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf]
verweise: [ccna-routing-grundlagen, ccna-statisches-routing, ccna-ospf, ccna-stp]
---

## Profi

### Problem
Hosts besitzen nur **ein Standardgateway**. Fällt der Router aus, verlieren alle Clients das Netz, obwohl ein zweiter Router bereitsteht. **FHRP** (First Hop Redundancy Protocol) lässt zwei oder mehr Router eine gemeinsame **virtuelle IP und virtuelle MAC** bereitstellen. Hosts verwenden die virtuelle IP als Gateway; ein Router ist **Active** (leitet weiter), der andere **Standby/Backup**.

### Protokolle
| Eigenschaft | HSRP | VRRP | GLBP |
|---|---|---|---|
| Hersteller | Cisco | IETF-Standard (RFC 5798) | Cisco |
| Rollen | Active / Standby | Master / Backup | AVG + mehrere AVF |
| Virtuelle MAC | 0000.0C07.ACxx (v1), 0000.0C9F.Fxxx (v2) | 0000.5E00.01xx | 0007.B400.xxyy |
| Multicast | 224.0.0.2 (v1) / 224.0.0.102 (v2) | 224.0.0.18 | 224.0.0.102 |
| Hello/Hold | 3 s / 10 s | 1 s / 3 s (Master-Down) | 3 s / 10 s |
| Lastverteilung | nur je Gruppe/VLAN | nur je Gruppe | **ja, pro Host** |
| Präemption | standardmäßig **aus** | standardmäßig **an** | aus |

### Funktionsweise (HSRP)
Gruppe (0–255 v1; 0–4095 v2), virtuelle IP im selben Subnetz. Höchste **Priorität** (Standard 100) wird Active; Gleichstand → höchste IP. `standby 1 priority 110` und `standby 1 preempt` übernehmen die Rolle bei Rückkehr. Mit `standby 1 track g0/1 20` sinkt die Priorität, wenn ein Uplink ausfällt. Zustände: Initial → Learn → Listen → Speak → Standby → Active. Der Active-Router antwortet auf ARP-Requests für die virtuelle IP mit der virtuellen MAC.

### Konfiguration
```
interface g0/0
 ip address 10.0.0.2 255.255.255.0
 standby version 2
 standby 1 ip 10.0.0.1
 standby 1 priority 110
 standby 1 preempt
```
VRRP: `vrrp 1 ip 10.0.0.1`, `vrrp 1 priority 110`. Kontrolle: `show standby brief`, `show vrrp brief`.

## Einfach

Stell dir vor, die Schule hat einen Hausmeister, der die einzige Tür zum Schulhof öffnet. Wird er krank, kommt niemand mehr raus. Besser: Es gibt zwei Hausmeister, aber an der Tür hängt **eine Telefonnummer**, die immer der Diensthabende abnimmt. Die Schüler wählen immer dieselbe Nummer und merken nicht, wer gerade Dienst hat. Das ist **HSRP/VRRP**.

- Die **gemeinsame Nummer** ist die **virtuelle IP**. Die Computer tragen sie als Standardgateway ein.
- Der Diensthabende ist der **Active** (bei VRRP: Master), der Ersatzmann der **Standby** (Backup).
- Beide Hausmeister rufen sich alle paar Sekunden zu: „Ich bin noch da!“ (Hello). Bleibt der Ruf aus, übernimmt der Ersatz sofort die Nummer.
- Der mit der **höheren Priorität** darf der Chef sein. Kommt der bessere Hausmeister aus dem Urlaub zurück, übernimmt er die Nummer nur, wenn **Preempt** eingeschaltet ist.

**GLBP** ist die Spezialvariante: Hier teilen sich beide die Arbeit – der erste Schüler wird zu Hausmeister 1 geschickt, der zweite zu Hausmeister 2. So ist keiner arbeitslos. HSRP und GLBP gehören Cisco, VRRP ist für alle Hersteller.

Warum das wichtig ist: In einer Firma hängen Drucker, Telefone und Computer alle am selben Gateway. Fällt dieser eine Router bei der Mittagspause aus, steht das ganze Büro. Mit FHRP merken die Mitarbeiter höchstens, dass ein Video kurz stockt. Das Prinzip ist immer gleich: eine Adresse nach außen, mehrere Geräte dahinter.

## Merksatz
- **FHRP = virtuelle IP + virtuelle MAC, Active/Standby.**
- **HSRP Cisco (Preempt aus), VRRP offen (Preempt an), GLBP verteilt Last.**
- **Priorität 100 Standard, höher gewinnt.**
- **HSRP 3/10 s, VRRP 1/3 s.**

## Prüfungsfalle
- Die **virtuelle IP darf nicht** die reale Interface-IP eines der Router sein (bei HSRP); bei VRRP ist es erlaubt (Owner hat Priorität 255).
- HSRP: **Preempt ist standardmäßig aus** – der bessere Router übernimmt nach Rückkehr nicht automatisch.
- Nur **GLBP** verteilt Last pro Host; HSRP/VRRP nutzen pro Gruppe nur einen Router (Lastverteilung über mehrere Gruppen/VLANs).
- HSRP v1 und v2 sind nicht kompatibel.
- Die Gateway-Adresse der Hosts ist die virtuelle IP.

## Grafik
### Failover
1. PC -> Active-Router: Gateway 10.0.0.1 (virtuelle MAC)
2. Active-Router -> Standby-Router: Hello (alle 3 s)
3. Active-Router: fällt aus
4. Standby-Router: Hold-Timer (10 s) abgelaufen – wird Active
5. PC -> Standby-Router: Gleiche virtuelle IP/MAC, Verkehr läuft

## Lab
**Packet Tracer: R1 und R2 am selben Switch, PC mit Gateway 10.0.0.1**

### Cisco IOS
```
R1(config)# interface g0/0
R1(config-if)# ip address 10.0.0.2 255.255.255.0
R1(config-if)# standby 1 ip 10.0.0.1
R1(config-if)# standby 1 priority 110
R1(config-if)# standby 1 preempt
R2(config)# interface g0/0
R2(config-if)# ip address 10.0.0.3 255.255.255.0
R2(config-if)# standby 1 ip 10.0.0.1
R1# show standby brief
```
1. Dauerping zum Gateway starten, R1 g0/0 `shutdown` → R2 übernimmt, 1–3 verlorene Pakete.
2. R1 `no shutdown` → mit Preempt wird R1 wieder Active.

## Befehle
- `standby 1 ip 10.0.0.1` – virtuelle IP
- `standby 1 priority 110` – Priorität
- `standby 1 preempt` – Rolle zurückholen
- `standby 1 track g0/1 20` – Priorität senken bei Uplinkausfall
- `show standby brief` – Status
- `vrrp 1 ip 10.0.0.1` – VRRP-Gruppe

## Übungen
- A: Welcher Router wird HSRP-Active: R1 Prio 100 (IP .2), R2 Prio 100 (IP .3)? | L: R2 (gleiche Priorität → höhere IP).
- A: Welche Rolle heißt bei VRRP Master? | L: Das Gegenstück zum HSRP-Active.
- A: Welches Protokoll ist IETF-Standard? | L: VRRP (RFC 5798).
- A: Gateway der Clients bei HSRP? | L: Die virtuelle IP der Gruppe.
- A: Welches FHRP verteilt Last automatisch? | L: GLBP.
- A: Wozu dient standby track? | L: Senkt Priorität, wenn ein überwachtes Interface ausfällt.

## Karteikarten
- F: Wofür FHRP? | A: Redundantes Standardgateway ohne Änderung bei den Hosts.
- F: Welches FHRP ist Cisco-proprietär? | A: HSRP und GLBP.
- F: VRRP-Standard? | A: RFC 5798 / IETF.
- F: HSRP-Standardpriorität? | A: 100.
- F: Standardmäßig Preempt bei HSRP? | A: Nein, aus.
- F: HSRP-Hello/Hold? | A: 3 s / 10 s.
- F: Virtuelle MAC HSRPv1? | A: 0000.0C07.ACxx.
- F: Virtuelle MAC VRRP? | A: 0000.5E00.01xx.
- F: Was macht GLBP anders? | A: Lastverteilung pro Host über mehrere Forwarder (AVG/AVF).
- F: Befehl zur Kontrolle HSRP? | A: show standby brief

## Quiz
? Welches FHRP ist ein offener Standard?
* VRRP
- HSRP
- GLBP
- STP
? Wie heißt der aktive Router bei VRRP?
* Master
- Active
- Root
- Designated
? Welche Priorität gilt bei HSRP standardmäßig?
* 100
- 1
- 255
- 128
? Wer wird bei HSRP Active, wenn die Prioritäten gleich sind?
* Router mit der höheren IP-Adresse
- Router mit niedriger IP
- Der zuerst gestartete
- Der mit niedrigster MAC
? Was ist das Gateway der Hosts?
* Die virtuelle IP
- Die IP des Active-Routers
- Die IP des Standby-Routers
- Die Broadcast-Adresse
? Welches Protokoll verteilt Last pro Host?
* GLBP
- HSRP
- VRRP
- DTP
? Was bewirkt standby preempt?
* Der bessere Router übernimmt nach Rückkehr wieder
- Er verhindert Failover
- Er ändert die virtuelle MAC
- Er schaltet Hello ab
? HSRP-Standardzeit bis Failover (Hold)?
* 10 Sekunden
- 1 Sekunde
- 60 Sekunden
- 3 Minuten
? Welcher Befehl zeigt den HSRP-Status?
* show standby brief
- show ip route
- show vrrp ospf
- show etherchannel
