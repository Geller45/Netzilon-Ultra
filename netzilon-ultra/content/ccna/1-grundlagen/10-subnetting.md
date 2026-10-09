---
id: ccna-subnetting
bereich: CCNA
block: CCNA 1.6
kapitel: Network Fundamentals
titel: Subnetting – Blockgröße, magisches Oktett, Netz/Broadcast in 30 Sekunden
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200-301.pdf, 05_Y_IPv4_2.pdf, 05_Y_IPv4_3.pdf]
verweise: [ap1-a4-subnetting, ccna-vlsm, ccna-ipv4-adressierung, netz-ipv4-uebung-2-3, netz-ipv4-uebung-4-5, ap1-a3-zahlensysteme]
---

## Profi

### Warum Subnetting?
**Classful** Vergabe war verschwenderisch (eine Firma mit 5.000 Hosts bekam ein Klasse-B-Netz mit 65.534 Adressen). 1993 führte die IETF **CIDR** (Classless Inter-Domain Routing) ein: beliebige Präfixlängen, Netze können in **Subnetze** geteilt (Subnetting) oder zusammengefasst (Supernetting/Summarization) werden. Vorteile: weniger Adressverschwendung, kleinere Broadcastdomänen, Sicherheit/Struktur, Routen-Zusammenfassung.

### Die Spickzettel-Tabelle (auswendig!)
| Blockgröße | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|---|
| Maskenwert | 128 | 192 | 224 | 240 | 248 | 252 | 254 | 255 |
| 4. Oktett | /25 | /26 | /27 | /28 | /29 | /30 | /31 | /32 |
| 3. Oktett | /17 | /18 | /19 | /20 | /21 | /22 | /23 | /24 |
| 2. Oktett | /9 | /10 | /11 | /12 | /13 | /14 | /15 | /16 |
**Blockgröße = 256 − Maskenwert** im „magischen Oktett“ (das Oktett, in dem die Maske nicht 255 und nicht 0 ist).

### Verfahren „magisches Oktett“ (für jede Aufgabe gleich)
1. Präfix → Maske und **magisches Oktett** bestimmen.
2. **Blockgröße** = 256 − Maskenwert.
3. Oktettwert der IP **durch Blockgröße** teilen, abrunden, mal Blockgröße = **Netz-ID**-Wert im magischen Oktett. Rechts davon: 0.
4. **Broadcast** = Netz-ID + Blockgröße − 1 im magischen Oktett, rechts davon 255.
5. **Erster Host** = Netz-ID + 1, **letzter Host** = Broadcast − 1.
6. **Hosts** = 2^(32 − Präfix) − 2; **Subnetze** (aus einem klassischen Netz) = 2^(geliehene Bits).

### Durchgerechnete Beispiele
**Beispiel 1: 154.219.154.180/20** – magisches Oktett: 3. (/20 → 255.255.**240**.0), Block = 16. 154 ÷ 16 = 9,6 → 9 · 16 = **144**. Netz **154.219.144.0**, Broadcast 144 + 15 = **154.219.159.255**, Hosts 154.219.144.1 – 154.219.159.254, 2¹² − 2 = **4.094**.

**Beispiel 2: 84.75.21.6/10** – 2. Oktett, /10 → 255.**192**.0.0, Block 64. 75 ÷ 64 = 1 → **64**. Netz **84.64.0.0**, Broadcast **84.127.255.255**, Hosts 2²² − 2 = **4.194.302**.

**Beispiel 3: 10.4.77.188/19** – 3. Oktett, 255.255.**224**.0, Block 32: Blöcke 0, 32, **64**, 96 → Netz **10.4.64.0**, nächstes Netz 10.4.96.0, Broadcast **10.4.95.255**, 2¹³ = 8.192 Adressen, 8.190 Hosts.

**Beispiel 4: 192.168.25.100/25 und 192.168.25.128/25** (200-301 Frage 9) – Block 128: Netze 192.168.25.**0**/25 (.0–.127) und 192.168.25.**128**/25 (.128–.255) → **verschiedene** Subnetze. Für lokale Kommunikation muss die Maske **/24 (255.255.255.0)** werden.

**Beispiel 5: 172.16.200.77/27** – magisches Oktett ist das 4. (255.255.255.**224**), Block 32: 77 ÷ 32 = 2,4 → 2 · 32 = **64**. Netz 172.16.200.64, Broadcast 172.16.200.95, Hosts .65–.94 (30).

**Beispiel 6: 10.0.0.0/8 in 2.000 Subnetze** – 2¹¹ = 2.048 ≥ 2.000 → **11 Bit leihen** → /8 + 11 = **/19** = 255.255.224.0, Hosts 2¹³ − 2 = **8.190** je Subnetz.

### Subnetze und Hosts bestimmen (Aufgabentypen)
- **„n Subnetze“** → kleinste Bitzahl s mit 2^s ≥ n → neue Präfixlänge = alt + s.
- **„h Hosts pro Subnetz“** → kleinste Hostbitzahl k mit 2^k − 2 ≥ h → Präfix = 32 − k.
- **Maske in Präfix**: Einsen zählen (255 = 8, 254 = 7, 252 = 6, 248 = 5, 240 = 4, 224 = 3, 192 = 2, 128 = 1).

### /31 und /32
- **/31** (RFC 3021): zwei Adressen, **beide nutzbar** – nur für **Punkt-zu-Punkt-Links** zwischen Routern (Cisco erlaubt es mit Warnung). Spart gegenüber /30 die Hälfte.
- **/32**: Hostroute (Loopback, statische Hostroute, ACL `host`).

### Wildcard-Maske (für OSPF und ACLs)
**Wildcard = 255.255.255.255 − Subnetzmaske**: /24 → 0.0.0.255, /26 → 0.0.0.63, /30 → 0.0.0.3, /19 → 0.0.31.255. 0-Bit = muss übereinstimmen, 1-Bit = egal.

## Einfach

Stell dir eine **Torte mit 256 Stücken** vor (ein Oktett). Subnetting heißt: Du schneidest die Torte in **gleich große Stücke**.
- Bei **/25** gibt es **2 Stücke à 128**.
- Bei **/26** gibt es **4 Stücke à 64**.
- Bei **/27** **8 Stücke à 32**, bei **/28** **16 Stücke à 16** … und so weiter. Jedes Mal halbiert sich das Stück.

Das Stück, in dem deine IP-Adresse liegt, ist dein **Subnetz**:
- Der **erste Krümel** des Stücks ist die **Netzadresse** (das Namensschild).
- Der **letzte Krümel** ist der **Broadcast** (der Lautsprecher).
- Alles dazwischen sind **Plätze für Geräte**.

**Beispiel**: 192.168.1.77/27 → Stücke à 32: 0, 32, **64**, 96 … 77 liegt im Stück, das bei **64** beginnt und vor **96** endet. Also: Netz **.64**, Broadcast **.95**, Geräte **.65 bis .94** = 30 Plätze.

Der Trick für die Prüfung: **256 minus die Maskenzahl = Stückgröße.** 255.255.255.**224** → 256 − 224 = **32**. Fertig!

Für die **Wildcard-Maske** (brauchst du bei OSPF und ACLs) drehst du die Maske einfach um: 255 wird 0, 0 wird 255, und aus 224 wird 31 (255 − 224).

## Merksatz
- **Blockgröße = 256 − Maskenwert.**
- **„128 – 192 – 224 – 240 – 248 – 252 – 254 – 255“** – einmal am Prüfungstag aufschreiben!
- **Hosts 2ⁿ − 2, Subnetze 2^s.**
- **Wildcard = 255 − Maske (pro Oktett).**
- **Netz = abrunden auf Vielfaches der Blockgröße.**

## Prüfungsfalle
- Blockgröße im **richtigen Oktett** anwenden: /19 → drittes Oktett, nicht viertes.
- Bei Hostanforderungen das **+2** nicht vergessen: 30 Hosts passen in /27, **31 Hosts nicht** (→ /26).
- 64 Hosts brauchen **/25** (2⁶ − 2 = 62 reicht nicht).
- Die Schulunterlage `05_Y_IPv4_3.pdf` enthält vorgedruckte Lösungen mit Fehlern: „/26 = **225.225.225**.192“ ist ein Tippfehler (richtig **255.255.255.192**); „127 Hosts → /26“ ist falsch (richtig **/24**, denn /25 hat nur 126 Hosts, /26 nur 62).
- Die Spalte „nächste 2er-Potenz“ in `05_Y_IPv4_3.pdf` meint die **nächstgrößere** Potenz (64 → 128, 255 → 512, 2 → 4); für reine Adresszählung reicht 2⁶ = 64. Für Hostaufgaben immer mit **+2** rechnen.
- /31 ist nur für Punkt-zu-Punkt gültig, nicht für LANs.

## Grafik
### Magisches Oktett
1. Text: Adresse 10.4.77.188/19
2. Text: /19 liegt im 3. Oktett → Maske 255.255.224.0
3. Text: Blockgröße 256 − 224 = 32
4. Text: Blöcke 0 – 32 – 64 – 96 werden als Balken eingeblendet
5. Text: 77 fällt in Block 64 → Netz 10.4.64.0
6. Text: Broadcast 10.4.95.255, Hosts 10.4.64.1 – 10.4.95.254

### Lokal oder nicht?
1. PC1: 192.168.25.100/25 → Netz .0
2. PC2: 192.168.25.128/25 → Netz .128
3. PC1 -> Router: Ziel in anderem Netz – geht ans Gateway
4. Text: Mit /24 liegen beide in 192.168.25.0 – direkte Kommunikation

## Lab
**Packet Tracer: R1 mit zwei LANs aus 192.168.50.0/24, aufgeteilt in /26** (R1 G0/0 → SW1 → PC1, R1 G0/1 → SW2 → PC2)

### Cisco IOS
1. Subnetze: 192.168.50.0/26 (GW .1) und 192.168.50.64/26 (GW .65).
```
R1(config)# interface g0/0
R1(config-if)# ip address 192.168.50.1 255.255.255.192
R1(config-if)# no shutdown
R1(config-if)# interface g0/1
R1(config-if)# ip address 192.168.50.65 255.255.255.192
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ip route connected
```
2. PC1 192.168.50.10/26 GW .1, PC2 192.168.50.70/26 GW .65 → `ping` von PC1 zu PC2 funktioniert über R1.
3. Fehler einbauen: PC2-Maske /24 → PC2 glaubt, PC1 sei lokal (ARP statt Gateway) → Ping scheitert in eine Richtung. Erklären!
4. `show ip route` zeigt **C** (connected /26) und **L** (local /32).

## Befehle
- `ip address 192.168.50.65 255.255.255.192` – Interface im /26 adressieren
- `show ip route connected` – direkt angeschlossene Subnetze
- `ipcalc 192.168.50.77/26` – Subnetzrechner unter Linux
- `ip subnet-zero` – Nutzung des Subnetzes 0 (seit IOS 12 Standard)

## Übungen
- A: 154.219.154.180/20 – Netz, Broadcast, Hosts | L: Block 16 im 3. Oktett, 154 → 144: Netz 154.219.144.0, Broadcast 154.219.159.255, 4.094 Hosts.
- A: 84.75.21.6/10 – Netz, Broadcast | L: Block 64 im 2. Oktett: Netz 84.64.0.0, Broadcast 84.127.255.255, 4.194.302 Hosts.
- A: 192.168.1.200/29 – Netz, Broadcast, Hostbereich | L: Block 8: 200 ÷ 8 = 25 → 200. Netz .200, Broadcast .207, Hosts .201–.206 (6).
- A: 172.30.99.5/22 – Netz, Broadcast | L: 3. Oktett, Block 4: 99 ÷ 4 = 24 → 96. Netz 172.30.96.0, Broadcast 172.30.99.255, 1.022 Hosts.
- A: 10.10.10.10/13 – Netz, Broadcast | L: 2. Oktett, Block 8: 10 → 8. Netz 10.8.0.0, Broadcast 10.15.255.255.
- A: Maske für 500 Hosts? | L: 2⁹ − 2 = 510 ≥ 500 → 9 Hostbits → /23 = 255.255.254.0.
- A: 206.73.118.0/24 in 6 Subnetze – Bits und Maske | L: 2³ = 8 ≥ 6 → 3 Bit, Netz-ID 27 Bit, Host-ID 5 Bit, /27 = 255.255.255.224.
- A: 206.73.118.0/24 – 9 Subnetze | L: 2⁴ = 16 ≥ 9 → 4 Bit → Netz-ID 28, Host-ID 4, /28 = 255.255.255.240.
- A: 206.73.118.0/24 – 18 Hosts pro Subnetz | L: 2⁵ − 2 = 30 ≥ 18 → Host-ID 5, Netz-ID 27, /27 = 255.255.255.224.
- A: 206.73.118.0/24 – 64 Hosts pro Subnetz | L: 2⁶ − 2 = 62 < 64, 2⁷ − 2 = 126 → Host-ID 7, Netz-ID 25, /25 = 255.255.255.128.
- A: 10.0.0.0/8 in 2.000 Subnetze – Präfix und Hosts | L: 2¹¹ = 2.048 → /19, 2¹³ − 2 = 8.190 Hosts.
- A: Wildcard für 255.255.240.0? | L: 0.0.15.255.

## Karteikarten
- F: Wie berechnet man die Blockgröße? | A: 256 minus Maskenwert im magischen Oktett.
- F: Maskenwerte für /25 bis /30? | A: 128, 192, 224, 240, 248, 252.
- F: Wie viele Hosts hat ein /28? | A: 2⁴ − 2 = 14.
- F: Präfix für 255.255.248.0? | A: /21.
- F: Präfix für 255.255.255.252? | A: /30 (2 Hosts – typischer P2P-Link).
- F: Wann nutzt man /31? | A: Für Punkt-zu-Punkt-Links zwischen Routern (RFC 3021), beide Adressen nutzbar.
- F: Wie viele Bit leiht man für 6 Subnetze? | A: 3 Bit (2³ = 8).
- F: Welche Maske für 60 Hosts? | A: /26 (62 Hosts).
- F: Wie lautet die Wildcard zu /26? | A: 0.0.0.63.
- F: Was ist CIDR? | A: Classless Inter-Domain Routing – Präfixe unabhängig von Adressklassen (1993).
- F: Wie viele Adressen hat ein /19? | A: 2¹³ = 8.192 (8.190 Hosts).

## Quiz
? Zwei PCs haben 192.168.25.128/25 und 192.168.25.100/25. Welche Maske müssen beide bekommen, um lokal zu kommunizieren?
* 255.255.255.0
- 255.255.255.224
- 255.255.255.248
- 255.255.255.252
@ 200-301.pdf Question 9

? Zu welchem Netz gehört 10.4.77.188/19?
* 10.4.64.0
- 10.4.77.0
- 10.4.32.0
- 10.4.72.0

? Wie lautet die Broadcastadresse von 172.16.200.77/27?
* 172.16.200.95
- 172.16.200.127
- 172.16.200.79
- 172.16.200.255

? Welche Maske braucht ein Netz für 64 Hosts mindestens?
* 255.255.255.128
- 255.255.255.192
- 255.255.255.224
- 255.255.255.0
! 2⁶ − 2 = 62 reicht nicht, also 7 Hostbits = /25.

? Wie viele nutzbare Hosts hat 154.219.144.0/20?
* 4.094
- 4.096
- 2.046
- 8.190

? Welche Wildcard-Maske gehört zu 255.255.255.224?
* 0.0.0.31
- 0.0.0.32
- 0.0.0.224
- 255.255.255.31

? Wie viele Subnetze entstehen, wenn ein /24 mit /26 aufgeteilt wird?
* 4
- 2
- 8
- 64

? Welche Präfixlänge entspricht 255.255.252.0?
* /22
- /21
- /23
- /20

## Lücken
- Die Maske /27 lautet 255.255.255.{224}.
- 256 − 240 ergibt die Blockgröße {16}.
- Für 500 Hosts braucht man mindestens das Präfix {/23}.
- Die Wildcard-Maske zu /30 ist {0.0.0.3}.

## Reihenfolge
### Netz-ID in 30 Sekunden
1. Präfix in Maske umrechnen und magisches Oktett finden
2. Blockgröße = 256 − Maskenwert
3. IP-Oktett durch Blockgröße teilen und abrunden
4. Ergebnis mal Blockgröße = Netz-ID-Oktett
5. Broadcast = Netz-ID + Blockgröße − 1
6. Erster und letzter Host = Netz + 1 und Broadcast − 1

## Spickzettel
- 128 192 224 240 248 252 254 255 = /25…/32 (bzw. /17…/24, /9…/16)
- Block = 256 − Maskenwert, Netz = abrunden auf Vielfaches
- Broadcast = Netz + Block − 1
- Hosts 2ⁿ − 2 · Subnetze 2^s · /31 P2P · /32 Host
- Wildcard = 255 − Maske
