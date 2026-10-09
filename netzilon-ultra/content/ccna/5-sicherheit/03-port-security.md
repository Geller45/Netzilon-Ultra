---
id: ccna-port-security
bereich: CCNA
block: CCNA 5.7
kapitel: Security Fundamentals
titel: Port Security und Layer-2-Absicherung – Sticky MAC, Violation, 802.1X
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, 200-301.pdf]
verweise: [ccna-switching-mac-arp, ccna-dhcp-snooping-dai, ccna-security-grundlagen, ccna-stp, ccna-vlan]
---

## Profi

### Zweck
**Port Security** beschränkt, **welche und wie viele MAC-Adressen** an einem **Access-Port** Frames senden dürfen. Schutz gegen **MAC-Flooding** (CAM-Table-Overflow), unautorisierte Geräte und Rogue-Switches. Voraussetzung: Port ist **statischer Access-Port** (oder Trunk, selten); DTP-Modi `dynamic` unterstützen es nicht.

### MAC-Lernmethoden
- **Statisch**: `switchport port-security mac-address 0011.2233.4455`.
- **Dynamisch** (Standard): gelernt, **nicht gespeichert** (gehen beim Neustart verloren).
- **Sticky**: `switchport port-security mac-address sticky` – gelernt **und in die running-config geschrieben** (mit `copy run start` dauerhaft).
Standard: **maximal 1** gesicherte MAC.

### Violation-Modi
| Modus | Verstoß-Frames | Syslog | Port | Zähler |
|---|---|---|---|---|
| **protect** | verworfen | nein | bleibt up | nein |
| **restrict** | verworfen | **ja** | bleibt up | ja |
| **shutdown** (Standard) | – | ja | **err-disabled** (down) | ja |
Wiederherstellen: `shutdown` / `no shutdown` oder `errdisable recovery cause psecure-violation` mit `errdisable recovery interval 300`.

### Konfiguration
```
interface f0/5
 switchport mode access
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 switchport port-security violation restrict
 switchport port-security aging time 10
```
Kontrolle: `show port-security`, `show port-security interface f0/5`, `show port-security address`, `show interfaces status err-disabled`. Aging: absolut oder inaktivitätsbasiert.

### Weitere Layer-2-Härtung
- Ungenutzte Ports `shutdown` und in ein **Blackhole-VLAN** (z. B. 999).
- **Native VLAN** ungleich 1, **DTP aus** (`switchport nonegotiate`), Trunk-Allowed-Liste.
- **PortFast + BPDU Guard** an Access-Ports.
- **DHCP Snooping, DAI, IP Source Guard** (siehe nächste Seite).
- **802.1X** (Port-based Network Access Control): Authenticator = Switch, RADIUS-Backend; `dot1x system-auth-control`, `authentication port-control auto`.
- CDP/LLDP und unnötige Dienste abschalten.

## Einfach

Stell dir einen **Parkplatz mit Schranke** vor, bei dem jeder Platz nur für **ein bestimmtes Auto** reserviert ist (die MAC-Adresse ist das Kennzeichen). Port Security ist der Pförtner, der mitzählt: „Dieser Platz hat nur 1 Auto. Steht plötzlich ein zweites oder ein fremdes Auto da?“

Was tut der Pförtner bei Verstößen? Drei Möglichkeiten:
- **Protect**: Er ignoriert den Eindringling still und sagt nichts.
- **Restrict**: Er ignoriert ihn, schreibt aber ein Protokoll und zählt mit.
- **Shutdown**: Er sperrt den **gesamten Platz** (der Port geht aus, „err-disabled“). Das ist die Standardeinstellung und die strengste.

Wie lernt er die Kennzeichen? Entweder du **schreibst sie vorher auf** (statisch), oder er lernt das erste Auto kennen und vergisst es nach dem Neustart (dynamisch), oder er **schreibt es in sein Buch** (sticky), sodass es auch nach dem Neustart noch drin steht, wenn du das Buch speicherst.

Warum das Ganze? Jemand könnte sein Laptop in die Netzwerkdose im Besprechungsraum stecken oder mit einem Programm tausende erfundene Kennzeichen schicken (MAC-Flooding), bis der Switch überfordert wird und alles wie ein Hub an alle verteilt. Port Security verhindert beides. Zusätzlich schaltet man nicht benutzte Dosen einfach aus.

## Merksatz
- **Port Security: max. MACs, Sticky speichert, Violation = shutdown (Standard).**
- **protect (still) – restrict (log) – shutdown (err-disabled).**
- **Standard maximum = 1 MAC.**
- **Nur Access-Ports, nicht dynamic.**
- **Wiederherstellung: shutdown → no shutdown.**

## Prüfungsfalle
- **Sticky MACs** stehen in der running-config – erst mit **`copy run start`** bleibt es erhalten.
- Port Security muss **explizit aktiviert** werden (`switchport port-security`) – die Unterbefehle allein reichen nicht.
- `shutdown` ist Standard-Violation, `err-disabled` ≠ `shutdown`: der Port wird vom Switch gesperrt.
- **protect** zählt Verstöße **nicht** und loggt nicht.
- `maximum 1` bei IP-Telefon + PC = Verstoß: Maximum 2 (bzw. 3) oder Voice-VLAN beachten.
- Der Port darf nicht `dynamic auto/desirable` sein.
- Ein Rogue-Switch hinter dem Port löst Violation aus, sobald mehr MACs als erlaubt sichtbar werden.

## Grafik
### Verstoß
1. PC1 -> SW1: Frame, Quell-MAC AAAA (Sticky gelernt)
2. SW1: Port Security: 1 von 1 MAC belegt
3. Angreifer -> SW1: Frame mit MAC BBBB
4. SW1: Violation – Modus shutdown
5. SW1: Port err-disabled, Syslog-Meldung %PM-4-ERR_DISABLE

### MAC-Flooding
1. Angreifer -> SW1: Tausende Frames mit zufälligen MACs
2. SW1: CAM-Tabelle voll (ohne Port Security)
3. SW1 -> Alle Ports: Unicast wird wie Broadcast geflutet
4. Text: Mit Port Security max=1 wird der Port nach der 2. MAC gesperrt

## Lab
**Packet Tracer: SW1 f0/5 – PC1, Laptop1 (Angreifer)**

### Cisco IOS
```
SW1(config)# interface f0/5
SW1(config-if)# switchport mode access
SW1(config-if)# switchport port-security
SW1(config-if)# switchport port-security maximum 1
SW1(config-if)# switchport port-security mac-address sticky
SW1(config-if)# switchport port-security violation shutdown
SW1(config-if)# end
SW1# show port-security interface f0/5
SW1# show running-config interface f0/5
SW1# copy running-config startup-config
```
1. PC1 pingen – Sticky-MAC erscheint.
2. PC1 abziehen, Laptop1 anstecken → Port err-disabled.
3. Wiederherstellen: `shutdown`, `no shutdown` (zuerst alten Eintrag mit `clear port-security sticky`).

## Befehle
- `switchport port-security` – aktivieren
- `switchport port-security maximum 2` – Anzahl MACs
- `switchport port-security mac-address sticky` – Sticky
- `switchport port-security violation restrict` – Modus
- `show port-security interface f0/5` – Status
- `show interfaces status err-disabled` – gesperrte Ports
- `clear port-security sticky interface f0/5` – Sticky löschen

## Übungen
- A: Welche Violation-Modi gibt es und welcher ist Standard? | L: protect, restrict, shutdown (Standard).
- A: Was passiert bei Sticky ohne copy run start? | L: Nach Neustart gehen die gelernten MACs verloren.
- A: Wie viele MACs sind standardmäßig erlaubt? | L: 1.
- A: Wie reaktivieren Sie einen err-disabled-Port? | L: shutdown, dann no shutdown (oder errdisable recovery).
- A: Port mit IP-Telefon und PC: sinnvolles Maximum? | L: 2 (Telefon + PC; mit Voice-VLAN meist 3).
- A: Welcher Angriff wird mit Port Security gehemmt? | L: MAC-Flooding / CAM-Overflow.

## Karteikarten
- F: Zweck von Port Security? | A: Begrenzung gültiger MACs je Access-Port.
- F: Standard-Violation? | A: shutdown (err-disabled).
- F: Modus ohne Log und Zähler? | A: protect.
- F: Modus mit Log, Port bleibt up? | A: restrict.
- F: Was ist Sticky? | A: Gelernte MACs werden in die running-config geschrieben.
- F: Standard-Maximum? | A: 1 MAC.
- F: Befehl zur Kontrolle? | A: show port-security interface
- F: Was ist err-disabled? | A: Port wurde durch Verstoß vom Switch abgeschaltet.
- F: Port-Security-Pflicht? | A: Statischer Access-Port.
- F: Was hilft gegen MAC-Flooding? | A: Port Security.

## Quiz
? Welcher Violation-Modus ist Standard?
* shutdown
- protect
- restrict
- drop
? Welcher Modus verwirft Frames, loggt aber und lässt den Port up?
* restrict
- protect
- shutdown
- err-disable
? Wie viele gesicherte MACs gelten standardmäßig?
* 1
- 2
- 8
- 132
? Wo landen Sticky-MACs?
* In der running-config
- In der VLAN-Datenbank
- In der MAC-Tabelle des Nachbarn
- Auf dem RADIUS-Server
? Wie reaktiviert man einen err-disabled-Port?
* shutdown und no shutdown
- reload
- clear vlan
- ip dhcp renew
? Welcher Angriff wird gemindert?
* MAC-Flooding
- Smurf
- Phishing
- DNS-Spoofing
? Welcher Portmodus ist erforderlich?
* Access (statisch)
- dynamic auto
- dynamic desirable
- routed
? Wirkt protect mit Protokollmeldung?
* Nein, protect loggt nicht
- Ja, immer
- Nur bei Sticky
- Nur im Trunk
? Wie speichert man Sticky-MACs dauerhaft?
* copy running-config startup-config
- write erase
- vlan database
- clear mac address-table
