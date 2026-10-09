---
id: ccna-acl-extended
bereich: CCNA
block: CCNA 5.6
kapitel: Security Fundamentals
titel: Access Control Lists – Standard, Extended, Named, Wildcard, Platzierung
stufe: Profi
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, 200-301.pdf]
verweise: [ccna-subnetting, ccna-nat, ccna-ssh-ftp-tftp, ccna-security-grundlagen]
---

## Profi

### Prinzip
Eine **ACL** (Access Control List) ist eine geordnete Liste von **permit/deny**-Regeln (ACEs), die Pakete nach Layer-3/4-Merkmalen filtert. Eigenschaften:
- Abarbeitung **von oben nach unten**, **erster Treffer gilt**.
- Am Ende steht ein **implizites `deny any`** (unsichtbar).
- Eine ACL wirkt erst, wenn sie an ein Interface gebunden ist: `ip access-group <ACL> in|out`.
- Pro Interface, Richtung und Protokoll nur **eine** ACL.
- ACLs filtern **durchlaufenden** Verkehr, nicht den vom Router selbst erzeugten Verkehr.
- Auch einsetzbar für **NAT, VTY (`access-class`), QoS, Route-Maps**.

### Wildcard-Maske
Wildcard = invertierte Subnetzmaske; **0 = muss passen, 1 = egal**. /24 → 0.0.0.255, /27 → 0.0.0.31, /30 → 0.0.0.3. Kürzel: `host 10.1.1.1` = 0.0.0.0; `any` = 0.0.0.0 255.255.255.255.

### Arten
| Art | Nummern | Filtert nach |
|---|---|---|
| **Standard** | 1–99, 1300–1999 | nur **Quell-IP** |
| **Extended** | 100–199, 2000–2699 | Protokoll, Quell-/Ziel-IP, **Ports**, Flags (`established`) |
| **Named** | frei | wie oben, mit Sequenznummern editierbar |

### Platzierung (Merkregel)
- **Standard ACL → nah am Ziel** (filtert nur Quelle, sonst würde sie zu viel blockieren).
- **Extended ACL → nah an der Quelle** (spart Bandbreite).

### Konfiguration
```
ip access-list standard BLOCK-GAST
 deny 192.168.30.0 0.0.0.255
 permit any
interface g0/1
 ip access-group BLOCK-GAST out

ip access-list extended WEB-ONLY
 10 permit tcp 192.168.10.0 0.0.0.255 any eq 80
 20 permit tcp 192.168.10.0 0.0.0.255 any eq 443
 30 permit udp any any eq 53
 40 deny ip any any log
interface g0/0
 ip access-group WEB-ONLY in
```
Editieren: Named ACL mit Sequenznummer (`no 20`, `15 permit …`); nummerierte alt: kompletter Neuaufbau. `ip access-list resequence`. Management: `line vty 0 15` / `access-class 10 in`.
Kontrolle: `show access-lists` (Trefferzähler), `show ip interface g0/0 | include access list`, `show running-config | section access`.

### Ports
`eq` (gleich), `neq`, `lt`, `gt`, `range 20 21`. Wichtige Ports: 20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 67/68 DHCP, 80 HTTP, 110 POP3, 123 NTP, 143 IMAP, 161/162 SNMP, 443 HTTPS, 3389 RDP. ICMP: `permit icmp any any echo-reply`.

## Einfach

Eine ACL ist wie die **Gästeliste vor einer Party**. Der Türsteher hat einen Zettel und liest die Regeln **von oben nach unten**:
1. „Anna darf rein.“
2. „Leute vom Nachbarhaus dürfen nicht rein.“
3. „Alle anderen dürfen rein.“
Sobald eine Regel auf dich passt, hört er auf zu lesen (**erster Treffer gilt**). Und am Ende des Zettels steht – unsichtbar – ganz unten: „**Alle anderen: nicht rein.**“ (implizites deny any). Wenn du nur „Nachbarhaus darf nicht rein“ aufschreibst, kommt wegen der unsichtbaren Regel *niemand* rein – du musst am Ende „alle anderen dürfen“ ergänzen.

Es gibt zwei Türsteher-Typen:
- **Standard**: schaut nur, **woher** du kommst (Absender).
- **Extended**: schaut auch, **wohin** du willst und **wofür** (Ziel, Protokoll, Port – z. B. nur Web, kein FTP).

Standort der Türsteher: Der einfache, der nur auf die Herkunft schaut, steht **nah am Ziel** (damit er niemanden zu früh abweist). Der genaue steht **nah an der Quelle**, damit unerwünschter Verkehr gar nicht erst durch das ganze Netz läuft.

Die **Wildcard-Maske** sagt dem Türsteher, wie genau er hinschauen muss: Eine 0 heißt „muss genau stimmen“, eine 1 heißt „egal“. 0.0.0.255 bedeutet: „Die ersten drei Zahlen müssen stimmen, die letzte ist egal“ – also das ganze Netz /24.

## Merksatz
- **Top-down, erster Treffer, am Ende implizit deny.**
- **Standard nah am Ziel, Extended nah an der Quelle.**
- **Wildcard: 0 = prüfen, 1 = egal.**
- **Eine ACL je Interface, Richtung, Protokoll.**
- **Spezifische Regeln nach oben.**

## Prüfungsfalle
- Vergessenes **`permit any` am Ende** blockiert alles.
- **Reihenfolge**: allgemeine Regel vor spezifischer überdeckt diese (Shadowing).
- **Richtung** (in/out) aus Sicht des Routers: `in` = Paket kommt in das Interface.
- **ACL wirkt nicht auf Pakete vom Router selbst** (z. B. Ping von R1).
- Standard-ACL: `access-list 10 deny 10.0.0.0 0.0.0.255` – Wildcard, nicht Subnetzmaske!
- Nummerierte ACLs kann man nicht zeilenweise ändern (älteres IOS); benannte ACLs ja.
- `access-list` erzeugt ACL global, wirkt aber erst mit `ip access-group`.
- `established` bedeutet ACK- oder RST-Flag gesetzt (Rückverkehr bestehender TCP-Sitzungen).

## Grafik
### ACL-Prüfung
1. PC1 -> Router: TCP 192.168.10.5 → 10.0.0.9:23 (Telnet)
2. Router: Regel 10 (permit tcp … eq 80) – kein Treffer
3. Router: Regel 20 (permit tcp … eq 443) – kein Treffer
4. Router: Regel 40 (deny ip any any) – Treffer, Paket verworfen
5. Router -> PC1: ICMP Administratively Prohibited

### Platzierung
1. Text: Quelle PC1 (192.168.10.0/24), Ziel Server (10.0.0.9)
2. Router1: Extended ACL – nah an der Quelle
3. Router2: Standard ACL – nah am Ziel

## Lab
**Packet Tracer: PC (192.168.10.5) – R1 – R2 – Webserver 10.0.0.9**

### Cisco IOS
```
R2(config)# ip access-list extended WEB-ONLY
R2(config-ext-nacl)# permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.9 eq 80
R2(config-ext-nacl)# permit tcp 192.168.10.0 0.0.0.255 host 10.0.0.9 eq 443
R2(config-ext-nacl)# permit icmp any any echo-reply
R2(config-ext-nacl)# deny ip any any log
R2(config-ext-nacl)# exit
R2(config)# interface g0/1
R2(config-if)# ip access-group WEB-ONLY out
R2# show access-lists
R1(config)# access-list 10 permit 10.0.99.0 0.0.0.255
R1(config)# line vty 0 15
R1(config-line)# access-class 10 in
```
1. Vom PC: Webzugriff funktioniert, Telnet nicht, Ping zum Server nicht (kein echo-Request erlaubt).
2. Trefferzähler beobachten.
3. Fehler: ACL ohne `permit` für DNS → Namensauflösung bricht.

## Befehle
- `ip access-list extended NAME` – Named ACL
- `permit tcp any any eq 80` – Regel mit Port
- `ip access-group NAME in|out` – an Interface binden
- `access-class 10 in` – an VTY binden
- `show access-lists` – Regeln mit Zählern
- `no 20` – Regel 20 löschen
- `ip access-list resequence NAME 10 10` – Nummern neu vergeben

## Übungen
- A: Wildcard für 192.168.4.0/22? | L: 0.0.3.255.
- A: Blockieren Sie Telnet von 10.0.0.0/24 zu jedem Ziel, erlauben Sie alles andere. | L: ip access-list extended NO-TELNET / deny tcp 10.0.0.0 0.0.0.255 any eq 23 / permit ip any any.
- A: Erlauben Sie nur Host 192.168.1.5 per SSH auf das Gerät. | L: access-list 5 permit host 192.168.1.5; line vty 0 15; access-class 5 in; transport input ssh.
- A: Warum schlägt die ACL "deny 192.168.1.0 0.0.0.255" ohne weitere Regeln alles? | L: Implizites deny any – es fehlt permit any.
- A: Wo setzt man eine Standard-ACL? | L: Nah am Ziel.
- A: Nennen Sie Ports für DNS, HTTPS, RDP. | L: 53, 443, 3389.

## Karteikarten
- F: Wie arbeitet eine ACL? | A: Top-down, erster Treffer, implizites deny am Ende.
- F: Nummern von Standard-ACLs? | A: 1–99 und 1300–1999.
- F: Nummern von Extended-ACLs? | A: 100–199 und 2000–2699.
- F: Wildcard für /24? | A: 0.0.0.255.
- F: Wo platziert man Extended-ACLs? | A: Nah an der Quelle.
- F: Wo platziert man Standard-ACLs? | A: Nah am Ziel.
- F: Welche Filterkriterien hat Standard? | A: Nur Quell-IP.
- F: Was bedeutet established? | A: TCP-Pakete mit ACK/RST (Rückverkehr bestehender Sitzungen).
- F: Wie bindet man ACL an VTY? | A: access-class <ACL> in
- F: Kürzel für 0.0.0.0 255.255.255.255? | A: any.
- F: Wirkt eine ACL auf Verkehr, den der Router selbst sendet? | A: Nein.

## Quiz
? Was steht am Ende jeder ACL?
* Implizites deny any
- Implizites permit any
- Ein Log-Eintrag
- Nichts
? Wo sollte man eine Standard-ACL platzieren?
* Nah am Ziel
- Nah an der Quelle
- Auf dem Switch
- Beliebig
? Wildcard-Maske für /27?
* 0.0.0.31
- 0.0.0.15
- 0.0.0.63
- 0.0.0.224
? Welche Nummern haben erweiterte ACLs?
* 100–199
- 1–99
- 200–299
- 500–599
? Wie wird eine ACL für SSH-Zugriff auf das Gerät genutzt?
* access-class an vty
- ip access-group an g0/0
- ip nat inside
- service-policy
? Wann wird die erste passende Regel angewendet?
* Immer von oben nach unten
- Immer die letzte
- Zufällig
- Die längste
? Welches Schlüsselwort steht für 0.0.0.0 255.255.255.255?
* any
- host
- all
- wildcard
? Was filtert eine Standard-ACL?
* Nur Quelladressen
- Quell- und Zielports
- Nur Zieladressen
- Nur MAC-Adressen
? Was bedeutet in beim ip access-group?
* Pakete, die ins Interface eintreten
- Pakete, die das Interface verlassen
- Nur Broadcasts
- Nur Router-Verkehr
