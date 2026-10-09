---
id: ccna-stp
bereich: CCNA
block: CCNA 2.5
kapitel: Network Access
titel: Spanning Tree (STP, RSTP, PVST+) – Root Bridge, Portrollen, PortFast, BPDU Guard
stufe: Profi
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, STP.md, 200_301_CCNA_v1.0_2.pdf]
verweise: [ccna-etherchannel, ccna-vlan, ccna-switching-mac-arp, ccna-trunk-intervlan]
---

## Profi

### Problem: Layer-2-Schleifen
Redundante Switch-Verbindungen sind gewünscht, aber Ethernet-Frames haben **kein TTL**. Broadcasts, Multicasts und unbekannte Unicasts kreisen endlos (**Broadcast Storm**), die MAC-Tabellen flappen (MAC-Instabilität), mehrere Kopien erreichen Hosts. **STP** (IEEE 802.1D) verhindert Schleifen, indem es Ports logisch **blockiert**, sodass eine **baumförmige Topologie** entsteht.

### Wahl der Root Bridge
Alle Switches senden **BPDUs** (Bridge Protocol Data Units, Multicast 01:80:C2:00:00:00, alle 2 s). Die **Bridge ID** = **Bridge Priority** (Standard 32768, in 4096er-Schritten) + **System-ID-Extension (VLAN-ID)** + **MAC-Adresse**. Der Switch mit der **niedrigsten Bridge ID** wird **Root Bridge**. Steuern: `spanning-tree vlan 10 root primary` (Priorität 24576 oder niedriger), `root secondary` (28672) oder `spanning-tree vlan 10 priority 4096`. Die Root Bridge sollte ein zentraler Core-/Distribution-Switch sein, nicht der zufällig älteste Access-Switch.

### Portrollen und -zustände (802.1D)
- **Root Port (RP)**: pro Nicht-Root-Switch der Port mit den **niedrigsten Pfadkosten** zur Root. Tie-Breaker: niedrigste Sender-Bridge-ID, dann niedrigste Sender-Port-ID.
- **Designated Port (DP)**: pro Segment der Port mit den niedrigsten Kosten zur Root; **alle Ports der Root Bridge** sind DPs.
- **Non-Designated / Alternate / Blocking**: alle übrigen Ports blockieren.
Pfadkosten (Short-Methode): 10 Mbit/s = 100, 100 Mbit/s = 19, 1 Gbit/s = 4, 10 Gbit/s = 2.
**802.1D-Zustände**: Blocking (20 s Max-Age) → Listening (15 s) → Learning (15 s) → Forwarding = bis zu **50 s** Konvergenz; Disabled.

### RSTP – Rapid STP (802.1w)
Konvergenz in **unter 1–2 s**. Portrollen: Root, Designated, **Alternate** (Backup zum Root Port), **Backup** (Backup eines DP am selben Segment). Zustände: **Discarding**, Learning, Forwarding. Schneller durch **Proposal/Agreement-Handshake** auf Punkt-zu-Punkt-Links (Vollduplex) und **Edge Ports**. Ausfallerkennung durch ausbleibende BPDUs (3 × Hello = 6 s) bzw. Linkstatus.

### PVST+ und Rapid PVST+
Cisco-Standard: **je VLAN eine eigene STP-Instanz** (Per-VLAN Spanning Tree Plus) – ermöglicht **Lastverteilung** (VLAN 10 über Trunk A, VLAN 20 über Trunk B). Moderne Catalysts nutzen **Rapid PVST+** (`spanning-tree mode rapid-pvst`). **MSTP** (802.1s) fasst VLANs zu Instanzen zusammen (weniger CPU).

### Schutzfunktionen
- **PortFast** (`spanning-tree portfast`): Access-Port geht sofort in Forwarding, überspringt Listening/Learning. Nur an **Endgeräten**.
- **BPDU Guard** (`spanning-tree bpduguard enable`): Port geht bei Empfang einer BPDU in **err-disabled** (Wiederherstellen: `shutdown`/`no shutdown` oder `errdisable recovery`). Global: `spanning-tree portfast bpduguard default`.
- **Root Guard**: verhindert, dass ein Port eine bessere Root-BPDU akzeptiert.
- **Loop Guard** und **UDLD**: schützen vor unidirektionalen Links.

### Kontrolle
`show spanning-tree [vlan 10]` zeigt Root-ID, eigene Bridge-ID, Rollen (Root/Desg/Altn), Zustände, Kosten, Port-Priorität (128.x).

## Einfach

Stell dir ein Dorf mit vielen Brücken vor, die mehrere Inseln verbinden. Wenn jede Brücke offen ist, laufen Leute im Kreis herum und rufen dabei immer lauter – ein einziges Chaos (der **Broadcast Storm**). Ein Verkehrsplaner sagt deshalb: „Wir sperren einige Brücken ab – aber nur so, dass jede Insel trotzdem erreichbar bleibt. Fällt eine offene Brücke aus, öffnen wir eine gesperrte wieder.“ Das ist **Spanning Tree**.

So entscheidet das Dorf:
1. **Bürgermeister wählen** (Root Bridge): Wer die kleinste Nummer hat (Priorität, bei Gleichstand die kleinste MAC), gewinnt. Der Bürgermeister steht in der Mitte.
2. Jeder andere Switch sucht den **kürzesten Weg zum Bürgermeister** – die Brücke dorthin ist sein **Root Port**.
3. Auf jeder Straße zwischen zwei Switches bekommt eine Seite das „Offen“-Schild (Designated Port). Wo es zu viele Wege gibt, bekommt eine Seite das „Gesperrt“-Schild (Blocking).

Das alte STP braucht bis zu **50 Sekunden**, bis die Schilder neu verteilt sind – wie ein sehr langsamer Verkehrsplaner. **RSTP** schafft es in 1–2 Sekunden. Und weil Computer am Rand keine Schleifen bilden können, dürfen deren Brücken mit **PortFast** sofort öffnen. Merkt der Switch dort aber plötzlich einen anderen Switch (BPDU), schaltet **BPDU Guard** die Brücke ab.

## Merksatz
- **Niedrigste Bridge-ID gewinnt: Priorität, dann MAC.**
- **Root: alle Ports Designated. Rest: ein Root Port, pro Segment ein DP, Rest blockiert.**
- **Kosten: 10 M=100, 100 M=19, 1 G=4, 10 G=2.**
- **802.1D: 20 + 15 + 15 = 50 s. RSTP < 2 s.**
- **PortFast nur an Endgeräten – und immer mit BPDU Guard.**

## Prüfungsfalle
- Die Bridge-Priorität ist **vlan-bezogen**: Priorität 32768 + VLAN-ID (z. B. 32778 für VLAN 10 – Anzeige in `show spanning-tree`).
- Bei gleicher Priorität gewinnt die **niedrigere MAC**, nicht die höhere.
- Der Root Port ist der Port mit niedrigsten **Pfadkosten zur Root**, nicht der schnellste Port am Switch an sich.
- **PortFast** an Switch-Ports ist gefährlich: Schleifen, wenn dort ein Switch angeschlossen wird.
- RSTP-Zustand heißt **Discarding** (nicht Blocking/Listening).
- Prioritäten nur in **4096er-Schritten** erlaubt.
- Hello-Intervall 2 s, Max-Age 20 s, Forward Delay 15 s.

## Grafik
### Root-Wahl und Blockierung
1. SW1 -> SW2: BPDU (Bridge ID 32769 + MAC aa)
2. SW2 -> SW3: BPDU (Bridge ID 32769 + MAC bb)
3. SW1: niedrigste MAC – wird Root Bridge
4. SW2: Root Port zum SW1 (Kosten 4), SW3: Root Port zum SW1 (Kosten 4)
5. SW3: Port zu SW2 – blockiert (höhere BID auf dem Segment)
6. Text: Dreiecksschleife aufgelöst, alle Hosts erreichbar

### Failover
1. SW2 -> SW1: Link fällt aus
2. SW3: Blockierter Port wechselt zu Listening/Learning/Forwarding (STP 50 s, RSTP < 2 s)
3. SW3 -> SW2: Verkehr läuft nun über den Umweg

## Lab
**Packet Tracer: Dreieck SW1–SW2–SW3, jeder Switch mit PC in VLAN 1**

### Cisco IOS
```
SW1(config)# spanning-tree mode rapid-pvst
SW1(config)# spanning-tree vlan 1 root primary
SW2(config)# spanning-tree mode rapid-pvst
SW3(config)# spanning-tree mode rapid-pvst
SW1# show spanning-tree
SW3# show spanning-tree
```
1. Auf SW3 den blockierten Port (Role Altn, Sts BLK/DIS) identifizieren.
2. Kabel SW1–SW3 trennen, ping -t beobachten, Umschaltzeit messen.
3. Access-Ports absichern:
```
SW2(config)# interface range f0/1 - 10
SW2(config-if-range)# spanning-tree portfast
SW2(config-if-range)# spanning-tree bpduguard enable
```
4. Test: Switch an einen BPDU-Guard-Port stecken → err-disabled; `show interfaces status err-disabled`.

## Befehle
- `show spanning-tree` – Root, Rollen, Zustände
- `spanning-tree mode rapid-pvst` – Rapid PVST+
- `spanning-tree vlan 10 root primary` – Root machen
- `spanning-tree vlan 10 priority 4096` – Priorität setzen
- `spanning-tree portfast` – Access-Port schnell
- `spanning-tree bpduguard enable` – Port bei BPDU abschalten
- `spanning-tree guard root` – Root Guard

## Übungen
- A: SW1 (Prio 32768, MAC 0001), SW2 (Prio 32768, MAC 0002), SW3 (Prio 4096, MAC 00ff): Wer ist Root? | L: SW3 (niedrigste Priorität).
- A: Wie hoch sind die Pfadkosten für einen 1-Gbit-Link? | L: 4 (Short-Methode).
- A: Wie lange dauert klassisches STP bis Forwarding? | L: Max-Age 20 s + Listening 15 s + Learning 15 s = 50 s.
- A: Welche Priorität setzt "root primary"? | L: 24576 oder niedriger, wenn nötig, um niedriger als die aktuelle Root zu sein.
- A: Warum BPDU Guard an PortFast-Ports? | L: Bei BPDU-Empfang (versehentlicher Switch) wird der Port err-disabled, so entsteht keine Schleife.
- A: Wie erkennen Sie in der Ausgabe, dass der Switch Root ist? | L: "This bridge is the root" und alle Ports Role Desg.

## Karteikarten
- F: Wofür steht STP und welcher Standard? | A: Spanning Tree Protocol, IEEE 802.1D.
- F: Wer wird Root Bridge? | A: Die niedrigste Bridge ID (Priorität + VLAN-ID + MAC).
- F: Standard-Bridge-Priorität? | A: 32768 (Schritte von 4096).
- F: Pfadkosten FastEthernet / Gigabit / 10G? | A: 19 / 4 / 2.
- F: Zustandsfolge bei 802.1D? | A: Blocking → Listening → Learning → Forwarding.
- F: Wie schnell konvergiert RSTP? | A: Unter 1–2 Sekunden.
- F: RSTP-Zustände? | A: Discarding, Learning, Forwarding.
- F: Was macht PortFast? | A: Access-Port geht sofort in Forwarding.
- F: Was macht BPDU Guard? | A: Setzt den Port bei empfangener BPDU auf err-disabled.
- F: Was ist PVST+? | A: Cisco: eine STP-Instanz je VLAN, ermöglicht Lastverteilung.
- F: Was ist ein Broadcast Storm? | A: Endloses Kreisen von Broadcasts in Layer-2-Schleifen.

## Quiz
? Welcher Switch wird Root Bridge?
* Der mit der niedrigsten Bridge ID
- Der mit der höchsten MAC
- Der mit den meisten Ports
- Der älteste Switch
? Welche Kosten hat ein Gigabit-Ethernet-Port (Short-Methode)?
* 4
- 19
- 100
- 1
? Wie heißt der RSTP-Zustand für nicht weiterleitende Ports?
* Discarding
- Blocking
- Listening
- Disabled
? Welche Funktion sperrt einen Access-Port bei Empfang einer BPDU?
* BPDU Guard
- Root Guard
- PortFast
- UDLD
? Wie lange braucht klassisches 802.1D bis zum Forwarding (max.)?
* 50 Sekunden
- 5 Sekunden
- 2 Sekunden
- 2 Minuten
? Welche Ports hat die Root Bridge?
* Nur Designated Ports
- Nur Root Ports
- Nur blockierte Ports
- Keine Ports
? Wofür ist PVST+ geeignet?
* Lastverteilung durch eine Instanz je VLAN
- Nur eine Instanz für alle VLANs
- Ersatz für DTP
- Verschlüsselung der BPDUs
? Welcher Befehl aktiviert Rapid PVST+?
* spanning-tree mode rapid-pvst
- spanning-tree rapid
- spanning-tree portfast default
- stp enable
? Bei gleicher Priorität entscheidet…
* die niedrigste MAC-Adresse
- die höchste MAC-Adresse
- die Reihenfolge des Einschaltens
- die VLAN-ID
