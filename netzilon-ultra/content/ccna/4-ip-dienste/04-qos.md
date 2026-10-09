---
id: ccna-qos
bereich: CCNA
block: CCNA 4.7
kapitel: IP Services
titel: QoS – Klassifizierung, Markierung (CoS, DSCP), Queuing, Policing, Shaping
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf]
verweise: [ccna-vlan, ccna-ntp-snmp-syslog, ccna-trunk-intervlan]
---

## Profi

### Warum QoS?
Konvergente Netze transportieren Sprache, Video und Daten gemeinsam. Ohne **Quality of Service** konkurrieren alle Pakete gleich; bei Überlast steigen **Bandbreitenbedarf, Delay (Latenz), Jitter (Laufzeitschwankung) und Packet Loss**. Richtwerte für **Sprache (VoIP)**: One-Way-Delay ≤ **150 ms**, Jitter ≤ **30 ms**, Verlust ≤ **1 %**, Bandbreite ca. 21–320 kbit/s je Anruf. Video: Delay ≤ 200–400 ms, Jitter ≤ 30–50 ms, Verlust ≤ 0,1–1 %.

### Die QoS-Bausteine
1. **Klassifizierung** (Classification): Verkehr in Klassen einordnen (ACL, NBAR, CoS/DSCP).
2. **Markierung** (Marking): Wert setzen – **Layer 2: CoS** (3 Bit PCP im 802.1Q-Tag, 0–7), **Layer 3: IP Precedence (3 Bit) / DSCP (6 Bit im ToS-Feld)**.
3. **Queuing** (Warteschlange): bei Überlast Reihenfolge festlegen – **FIFO**, **WFQ**, **CBWFQ**, **LLQ** (Low Latency Queuing = **Prioritätsqueue** für Sprache + CBWFQ für den Rest).
4. **Congestion Management/Avoidance**: **WRED** (Weighted Random Early Detection) verwirft früh zufällig, um TCP-Global-Synchronisation zu vermeiden.
5. **Policing**: überschreitender Verkehr wird **verworfen oder umgemarkt** (kein Puffer), Eingang oder Ausgang.
6. **Shaping**: überschreitender Verkehr wird **gepuffert** und verzögert (nur Ausgang), glättet Bursts, z. B. zum Provider.

### DSCP-Werte (PHB)
| Klasse | DSCP | Dezimal | Verwendung |
|---|---|---|---|
| **EF** (Expedited Forwarding) | 101110 | 46 | Sprache (Priorität, niedrige Verzögerung) |
| **AF41** | 100010 | 34 | Video-Konferenz |
| **AF31/AF21/AF11** | 011010/010010/001010 | 26/18/10 | Anwendungsdaten, Transaktionen, Bulk |
| **CS3** | 011000 | 24 | Signalisierung |
| **BE/Default** | 000000 | 0 | Best Effort |
AF xy: x = Klasse (1–4), y = Drop-Wahrscheinlichkeit (1 niedrig – 3 hoch). **CS** (Class Selector) ist kompatibel zu IP Precedence.

### Trust-Boundary
Die Grenze, ab der Markierungen vertraut werden. Gut: Markierung am **Access-Switch** oder am **IP-Telefon** (Trust nur wenn Telefon erkannt: `mls qos trust device cisco-phone`, `mls qos trust dscp`/`cos`). PC-Markierungen nicht vertrauen. Voice-VLAN: `switchport voice vlan 150`.

### PHB – Per-Hop-Behavior
Jeder Router entscheidet pro Hop (DiffServ-Modell), Alternativen: Best-Effort (kein QoS), IntServ (RSVP, Reservierung – wenig skalierbar), **DiffServ (Standard)**.

## Einfach

Stell dir eine Autobahn mit nur einer Spur und viel Verkehr vor. Normalerweise fährt jeder, wie er ankommt – auch der Krankenwagen steckt im Stau. **QoS** ist ein System, das Fahrzeugen **Prioritäten** gibt.

1. **Sortieren** (Klassifizieren): Am Eingang schaut ein Aufpasser, was für ein Fahrzeug kommt: Krankenwagen (Telefongespräch), Reisebus (Video) oder Lieferwagen (Downloads).
2. **Aufkleben** (Markieren): Jedes Fahrzeug bekommt einen Aufkleber mit seiner Klasse. Krankenwagen: „EF = 46“.
3. **Warteschlangen** (Queuing): Auf der Straße gibt es eine **VIP-Spur** nur für Krankenwagen (LLQ), danach eine für Busse, den Rest für alle anderen.
4. **Bremsen** (Policing/Shaping): Wenn jemand mehr verbrauchen will als vereinbart, wird er entweder **sofort weggeschickt** (Policing) oder darf in einer **Warteschlange warten** (Shaping).

Warum ist das bei Telefonaten so wichtig? Sprache verträgt kaum Wartezeit. Wenn die Worte wie bei einer Burst-Übertragung verspätet kommen, klingt es abgehackt (Jitter). Eine Datei kann aber ruhig ein paar Sekunden länger brauchen. Deshalb bekommt Sprache Vorrang. Das Telefon (oder der Access-Switch) markiert den Verkehr direkt am Eingang; dem PC der Mitarbeiter traut man nicht, sonst könnte jeder behaupten, er sei ein Krankenwagen.

## Merksatz
- **Klassifizieren – Markieren – Queuing – Policing/Shaping.**
- **VoIP: Delay ≤ 150 ms, Jitter ≤ 30 ms, Loss ≤ 1 %.**
- **EF = 46 = Sprache. AF41 = 34 = Video.**
- **Policing verwirft, Shaping puffert.**
- **CoS = Layer 2 (802.1Q), DSCP = Layer 3 (IP-Header).**

## Prüfungsfalle
- **Shaping** puffert (nur Ausgang), **Policing** verwirft/markiert um (Ein- und Ausgang).
- **CoS** funktioniert nur auf **Trunks mit 802.1Q** (Tag) – im Access-Port gibt es kein Tag; DSCP bleibt Ende-zu-Ende.
- **EF** hat den Wert 46, nicht 48.
- LLQ = **strikte Priorität + CBWFQ**, nicht WRR.
- QoS vergrößert **keine** Bandbreite; es verteilt nur bei Engpass.
- Jitter ≠ Delay: Jitter ist die **Schwankung** der Laufzeit.
- Best Effort ist der Standard (kein QoS).

## Grafik
### QoS-Pipeline
1. Text: Pakete kommen an – Klassifizierung nach ACL/DSCP
2. Telefon -> Access-Switch: Sprachpaket DSCP EF (46)
3. Access-Switch: Trust-Boundary prüft Markierung
4. Access-Switch -> Router: Ausgangswarteschlange – LLQ (Priorität)
5. Router -> WAN: Shaper glättet auf 10 Mbit/s
6. Text: Dateidownload (BE) wartet länger, Sprache bleibt unter 150 ms

### Policing vs. Shaping
1. Text: Gebuchte Rate 10 Mbit/s, Burst 15 Mbit/s
2. Text: Policing: 5 Mbit/s Überschuss werden verworfen
3. Text: Shaping: Überschuss wird gepuffert und später gesendet

## Lab
**Packet Tracer: IP-Telefon an SW1 (Voice-VLAN 150), PC dahinter in VLAN 10**

### Cisco IOS
```
SW1(config)# mls qos
SW1(config)# interface f0/1
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport voice vlan 150
SW1(config-if)# mls qos trust device cisco-phone
SW1(config-if)# mls qos trust cos
R1(config)# class-map match-any VOICE
R1(config-cmap)# match dscp ef
R1(config)# policy-map WAN-OUT
R1(config-pmap)# class VOICE
R1(config-pmap-c)# priority 512
R1(config-pmap-c)# class class-default
R1(config-pmap-c)# fair-queue
R1(config)# interface g0/1
R1(config-if)# service-policy output WAN-OUT
R1# show policy-map interface g0/1
```
1. Sprachpakete mit EF markieren und im Simulationsmodus prüfen.
2. Variante Shaping: `shape average 10000000`.

## Befehle
- `mls qos trust dscp` – DSCP vertrauen
- `class-map`, `policy-map`, `service-policy` – MQC (Modular QoS CLI)
- `priority 512` – LLQ mit 512 kbit/s
- `police` – Policer
- `shape average` – Shaper
- `show policy-map interface` – QoS-Statistik

## Übungen
- A: Welche Grenzwerte gelten für VoIP? | L: Delay ≤ 150 ms (one-way), Jitter ≤ 30 ms, Loss ≤ 1 %.
- A: DSCP-Wert und Name für Sprache? | L: EF = 46.
- A: Unterschied Policing/Shaping? | L: Policing verwirft/markiert um, Shaping puffert und verzögert.
- A: Wo sollte die Trust-Boundary liegen? | L: So nahe an der Quelle wie möglich, am Access-Switch oder IP-Telefon.
- A: Welche Queuing-Methode ist für Sprache + Daten empfohlen? | L: LLQ (Priorität für Sprache + CBWFQ).
- A: Wie viele Bits hat DSCP? | L: 6 Bit im ToS/DS-Feld.

## Karteikarten
- F: Wofür steht QoS? | A: Quality of Service – priorisierte Behandlung bestimmter Verkehrsarten.
- F: Layer-2-Markierung? | A: CoS (3 Bit im 802.1Q-Tag).
- F: Layer-3-Markierung? | A: DSCP (6 Bit) bzw. IP Precedence.
- F: DSCP für Sprache? | A: EF (46).
- F: Jitter? | A: Schwankung der Paketlaufzeit.
- F: Policing vs. Shaping? | A: Verwerfen vs. Puffern.
- F: LLQ? | A: Low Latency Queuing – strikte Prioritätswarteschlange plus CBWFQ.
- F: Trust-Boundary? | A: Punkt, ab dem Markierungen vertraut werden.
- F: DiffServ? | A: Klassenbasiertes QoS-Modell mit Per-Hop-Behavior.
- F: Befehl zur QoS-Kontrolle? | A: show policy-map interface

## Quiz
? Welcher DSCP-Wert gehört zu Sprache?
* EF (46)
- AF41 (34)
- CS3 (24)
- BE (0)
? Wie viele Bit hat DSCP?
* 6
- 3
- 8
- 4
? Was unterscheidet Shaping von Policing?
* Shaping puffert, Policing verwirft
- Shaping verwirft, Policing puffert
- Beide puffern
- Beide verschlüsseln
? Maximaler empfohlener One-Way-Delay für Sprache?
* 150 ms
- 15 ms
- 500 ms
- 1 s
? Welche Queue wird für Echtzeitverkehr bevorzugt?
* LLQ
- FIFO
- WRED
- Round Robin
? Was ist Jitter?
* Laufzeitschwankung
- Bandbreite
- Paketgröße
- Verlustrate
? Wo liegt CoS?
* Im 802.1Q-Tag (3 Bit)
- Im TCP-Header
- Im IPv6-Flow-Label
- Im Ethernet-FCS
? Was macht WRED?
* Verwirft früh zufällig Pakete bei drohender Überlast
- Verschlüsselt Pakete
- Verteilt Last auf Links
- Markiert Pakete als EF
? Wem soll man Markierungen vertrauen?
* Nur Geräten innerhalb der Trust-Boundary
- Jedem PC
- Nur dem Internet
- Allen Paketen
