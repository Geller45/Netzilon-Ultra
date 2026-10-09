---
id: netz-ethernet-csma-cd-frame
bereich: CCNA
block: Netzwerk
kapitel: Ethernet / OSI 1-2
titel: Ethernet – Klassisches Ethernet, CSMA/CD, Frame-Aufbau und Switched Ethernet
stufe: Einsteiger
fach: TCP/IP – CCNA – Basic
pruefungen: [AP1, CCNA, Schule]
quellen: [Ethernet.md (OSI 1), Ethernet.md (OSI 2), Klassic Ethernet.md, CSMA-CD.md, Frame-Types.md, Switchin-Internet.md]
verweise: [ccna-switching-mac-arp, ccna-kabel-schnittstellen, ccna-osi-tcpip, netz-datenuebertragung-switching]
---

## Profi

### Entwicklung von Ethernet (IEEE 802.3)
| Variante | Medium / Gerät | Topologie (physisch / logisch) | Kollisionen |
|---|---|---|---|
| Klassisches Ethernet (10 Mbit/s) | Koaxialkabel | Bus / Bus | ja (gemeinsames Medium) |
| Ethernet mit **Hub** | Twisted Pair, Hub | Stern / **Bus** (Hub wiederholt alles an alle Ports) | ja |
| **Switched Ethernet** (ab Fast Ethernet, IEEE 802.3u, 1995) | Twisted Pair / LWL, **Switch** | Stern, logisch Punkt-zu-Punkt | **keine** bei Vollduplex |
Geschwindigkeiten: Ethernet 10 Mbit/s, Fast Ethernet 100 Mbit/s, Gigabit Ethernet 1 Gbit/s (802.3z Glasfaser, 802.3ab Kupfer), 2,5/5G, 10G (802.3ae Glasfaser, 802.3an Kupfer), 100G. **Ab 10 Gigabit Ethernet gibt es nur noch Switched Ethernet** (kein Hub, kein CSMA/CD).

### CSMA/CD (Carrier Sense Multiple Access with Collision Detection)
Zugriffsverfahren im klassischen, geteilten Ethernet (Bus oder Hub), 1973 erfunden. Es **sucht und behandelt** Kollisionen:
1. **Carrier Sense**: Die Station hört das Medium ab. Ist es **frei** (kein Frame unterwegs), darf sie senden.
2. **Multiple Access**: Mehrere Stationen konkurrieren um dasselbe Medium.
3. **Collision Detection**: Beim Senden liest die Station das Signal mit und **vergleicht** es mit dem gesendeten. Weicht es ab, ist eine **Kollision** entstanden.
4. Die Station sendet ein **Jam-Signal**; es verzerrt alle Signale, sodass alle Stationen die Kollision erkennen und das Senden einstellen.
5. Wartezeit nach **Binary Exponential Backoff (BEB)**: zufällige Zeit, die sich mit jeder weiteren Kollision verdoppelt. Nach **16 erfolglosen Versuchen** gilt das Netz als nicht erreichbar, die Übertragung wird abgebrochen.

Ablauf des Sendens: **Preamble** (8 Byte: 7 × `10101010` + Start-Frame-Delimiter `10101011` zur Synchronisation und Frame-Erkennung), Frame, danach das **Interframe Gap** (9,6 µs bei 10 Mbit/s), damit keine Station das Medium monopolisiert. Alle Stationen im Segment lesen die ersten 6 Byte (Ziel-MAC), vergleichen mit der eigenen MAC und **verwerfen** den Frame, wenn sie nicht passt; passt sie, wird der Frame weiter gepuffert.

### Ethernet-II-Frame (DIX)
| Preamble | Ziel-MAC | Quell-MAC | Type | Daten (Payload) | FCS |
|---|---|---|---|---|---|
| 8 Byte | 6 Byte | 6 Byte | 2 Byte | 46–1500 Byte | 4 Byte |
- **Minimale Framegröße 64 Byte, maximale 1518 Byte** (ohne Preamble gerechnet: 6+6+2+46+4 = 64; 6+6+2+1500+4 = 1518). Die 46 Byte Mindest-Nutzdaten (ggf. Padding) stellen sicher, dass eine Kollision noch **während des Sendens** erkannt wird.
- **Type-Feld** (EtherType): `0x0800` = IPv4, `0x86DD` = IPv6, `0x0806` = ARP.
- **FCS** (Frame Check Sequence) = CRC-32-Prüfsumme; fehlerhafte Frames werden verworfen (Interface-Zähler *CRC*).
- MTU (Nutzdaten) = 1500 Byte.

### Switched Ethernet
Ein **Switch** lernt aus der **Quell-MAC** jedes eingehenden Frames, an welchem Port die Station hängt (MAC-Adresstabelle: Port ↔ MAC). Bekannte Ziel-MAC → **Unicast** nur an den Zielport; unbekannte Ziel-MAC → **Flooding** an alle Ports außer dem Eingangsport (wie bei einem Hub). Jeder Port ist eine eigene **Kollisionsdomäne**; im **Vollduplex**-Betrieb treten keine Kollisionen auf. **Halbduplex** (selten, Altgeräte, Duplex-Mismatch) kann Kollisionen verursachen.

## Einfach

Stell dir vor, ein Klassenzimmer, in dem alle Schüler über **einen einzigen Lautsprecher** miteinander reden. Wer sprechen will, **hört zuerst hin**: Ist es still, darf er reden (das ist *Carrier Sense*). Manchmal fangen zwei gleichzeitig an – dann ist es Kauderwelsch (*Kollision*). Beide merken das, rufen laut „Stopp!“ (das **Jam-Signal**), warten eine **zufällige Zeit** und versuchen es nochmal. Wer Pech hat, wartet beim nächsten Mal länger (die Wartezeit verdoppelt sich: **BEB**). Nach 16 Versuchen gibt er auf.

So war das früher mit dem **Hub**: Alles, was einer sendet, hören alle. Ein **Switch** ist viel klüger: Er ist wie ein **Postbote mit Klingelschild-Liste**. Er merkt sich, wer an welcher Tür (Port) wohnt, und bringt den Brief nur dorthin. Kennt er den Empfänger noch nicht, ruft er einmal in alle Flure. Weil jeder eine eigene Leitung hat und in beide Richtungen gleichzeitig sprechen kann (**Vollduplex**), gibt es **keine Kollisionen** mehr.

Ein **Frame** ist wie ein Brief: vorne Empfänger- und Absenderadresse (MAC, je 6 Byte), dann ein Feld „Was ist drin?“ (Type: IPv4, IPv6, ARP), dann der Inhalt (mindestens 46, höchstens 1500 Byte) und am Ende eine **Prüfsumme** (FCS), mit der der Empfänger merkt, ob der Brief unterwegs kaputtgegangen ist. Ein ganzer Frame ist also mindestens 64 und höchstens 1518 Byte lang.

## Merksatz
- **CSMA/CD: erst hören, dann senden; bei Kollision Jam, warten (BEB), max. 16 Versuche.**
- **Frame 64–1518 Byte, Daten 46–1500 Byte, Adressen je 6 Byte, FCS 4 Byte.**
- **Type: 0800 IPv4, 86DD IPv6, 0806 ARP.**
- **Hub = ein Kollisionsbereich, Switch = jeder Port eine eigene Kollisionsdomäne.**
- **Ab 10 GbE nur noch Switching, kein CSMA/CD.**

## Prüfungsfalle
- Hub: **physisch Stern, logisch Bus** – nicht „Stern/Stern“.
- Die Obsidian-Notiz schreibt „Switch-Topologie Full-Mesh“; tatsächlich ist die Verkabelung physisch ein **Stern**, die logische Verbindung **Punkt-zu-Punkt** (nicht jedes Gerät hängt an jedem).
- 1518 Byte sind **ohne Preamble** gezählt; mit Preamble wären es 1526 Byte. 802.1Q-VLAN-Tag erhöht auf 1522 Byte.
- **MTU 1500** meint nur die Nutzdaten, nicht den ganzen Frame.
- CSMA/CD gilt **nur bei Halbduplex/Shared Medium**. Auf Vollduplex-Switchports ist es abgeschaltet.
- Ein **Duplex-Mismatch** (eine Seite Voll-, die andere Halbduplex) führt zu *late collisions* und CRC-Fehlern.
- Jam-Signal ≠ Preamble: Preamble synchronisiert beim Senden, Jam meldet die Kollision.

## Grafik
### CSMA/CD mit Kollision
1. PC-A: Hört ab – Medium frei (Carrier Sense)
2. PC-B: Hört ab – Medium frei (Carrier Sense)
3. PC-A -> Hub: Frame wird gesendet
4. PC-B -> Hub: Sendet gleichzeitig – Kollision
5. Hub: Signale überlagern sich, Kollision erkannt
6. PC-A -> PC-B: Jam-Signal
7. PC-A: Wartet zufällige Zeit (Backoff), versucht erneut
8. PC-A -> Hub: Zweiter Versuch erfolgreich

### Switch lernt und leitet weiter
1. PC-A -> Switch: Frame an PC-C (Ziel-MAC unbekannt)
2. Switch: Lernt Quell-MAC von PC-A auf Port 1
3. Switch -> PC-B: Flooding an alle anderen Ports
4. Switch -> PC-C: Flooding an alle anderen Ports
5. PC-C -> Switch: Antwort-Frame an PC-A
6. Switch: Lernt PC-C auf Port 3
7. Switch -> PC-A: Unicast nur an Port 1

## Lab
### Cisco IOS
Gerät: **SW1** (Catalyst, Layer 2). PC-A an Fa0/1, PC-C an Fa0/3.
```
SW1> enable
SW1# clear mac address-table dynamic
SW1# show mac address-table dynamic
SW1# configure terminal
SW1(config)# interface range fastEthernet 0/1 - 3
SW1(config-if-range)# speed 100
SW1(config-if-range)# duplex full
SW1(config-if-range)# end
SW1# show interfaces fastEthernet 0/1
SW1# show interfaces fastEthernet 0/1 counters errors
SW1# show mac address-table address 0050.7966.6800
SW1# show interfaces status
```
Beobachtung: Nach `clear` ist die Tabelle leer. Nach einem Ping zwischen PC-A und PC-C erscheinen beide MACs mit Typ *DYNAMIC* und dem jeweiligen Port. In `show interfaces` stehen *Full-duplex, 100Mb/s* und die Zähler *CRC*, *collisions*, *late collision* (bei sauberem Vollduplex 0).
### Fehlersuche Duplex-Mismatch
```
SW1# show interfaces fa0/1 | include duplex|collisions|CRC
SW1(config-if)# duplex auto
SW1(config-if)# speed auto
```
Steigende *late collision* und *CRC* auf einer Seite deuten auf Mismatch hin; Lösung: beide Seiten auf `auto` oder beide fest identisch.

## Befehle
- `show mac address-table` – MAC-Adresstabelle des Switches (Port ↔ MAC)
- `clear mac address-table dynamic` – gelernte Einträge löschen
- `show interfaces fa0/1` – Duplex, Speed, Zähler (CRC, Kollisionen)
- `duplex full` / `speed 100` – Duplex und Geschwindigkeit fest setzen
- `show interfaces status` – Kurzübersicht aller Ports
- `ipconfig /all` (Windows) – MAC-Adresse des Clients (Physische Adresse)

## Übungen
- A: Wie groß sind Mindest- und Höchstlänge eines Ethernet-II-Frames (ohne Preamble)? | L: 64 Byte und 1518 Byte (Daten 46–1500 Byte).
- A: Nenne die Felder eines Ethernet-II-Frames in Reihenfolge. | L: Preamble (8), Ziel-MAC (6), Quell-MAC (6), Type (2), Daten (46–1500), FCS (4).
- A: Welcher EtherType gehört zu IPv4, IPv6, ARP? | L: 0x0800, 0x86DD, 0x0806.
- A: Was passiert bei einer Kollision nach CSMA/CD? | L: Jam-Signal, Senden abbrechen, Backoff (BEB), erneuter Versuch; nach 16 Versuchen Abbruch.
- A: Wie verhält sich ein Switch bei unbekannter Ziel-MAC? | L: Flooding an alle Ports außer dem Eingangsport.
- A: Welche Topologie hat ein Hub-Netz physisch und logisch? | L: Physisch Stern, logisch Bus.
- A: Warum braucht ein Frame mindestens 46 Byte Daten? | L: Damit eine Kollision noch während des Sendens erkannt werden kann (Mindestframe 64 Byte, ggf. Padding).

## Karteikarten
- F: Wofür steht CSMA/CD? | A: Carrier Sense Multiple Access with Collision Detection.
- F: Seit wann wird CSMA/CD genutzt und wo? | A: Erfunden 1973, klassisches Ethernet (IEEE 802.3) mit Bus/Hub (shared Medium).
- F: Was sendet eine Station nach erkannter Kollision? | A: Ein Jam-Signal.
- F: Wofür steht BEB? | A: Binary Exponential Backoff – Wartezeit verdoppelt sich mit jeder Kollision.
- F: Wie viele Sendeversuche macht CSMA/CD maximal? | A: 16.
- F: Länge der Preamble? | A: 8 Byte (7 × 10101010, dann 10101011).
- F: Mindest-/Höchstgröße eines Ethernet-Frames? | A: 64 / 1518 Byte.
- F: Größe einer MAC-Adresse im Frame? | A: 6 Byte (48 Bit).
- F: Wie lang ist die FCS und wozu dient sie? | A: 4 Byte, CRC-Prüfsumme zur Fehlererkennung.
- F: EtherType von IPv4, IPv6, ARP? | A: 0800, 86DD, 0806.
- F: Ab welchem Standard gibt es Switched Ethernet? | A: Fast Ethernet, IEEE 802.3u (1995).
- F: Was ist ein Interframe Gap? | A: Pause von 9,6 µs (bei 10 Mbit/s) zwischen Frames, verhindert Monopolisieren des Mediums.

## Quiz
? Wofür steht CSMA/CD?
* Carrier Sense Multiple Access with Collision Detection
- Carrier Switch Multiple Access with Collision Detection
- Central Sense Media Access with Collision Delay
- Collision Sense Multiple Address with Congestion Detection
? Wie viele Sendeversuche unternimmt eine Station bei CSMA/CD höchstens?
* 16
- 3
- 8
- 64
? Was senden Stationen nach dem Erkennen einer Kollision?
* Ein Jam-Signal
- Ein ARP-Request
- Ein Broadcast-Frame
- Eine Preamble
? Wie groß ist ein Ethernet-II-Frame mindestens (ohne Preamble)?
* 64 Byte
- 46 Byte
- 128 Byte
- 1518 Byte
? Welche Topologie hat ein Hub-Netzwerk?
* Physisch Stern, logisch Bus
- Physisch Bus, logisch Stern
- Physisch und logisch Ring
- Physisch Vollvermascht
? Welcher EtherType kennzeichnet ARP?
* 0x0806
- 0x0800
- 0x86DD
- 0x8100
? Was macht ein Switch mit einem Frame, dessen Ziel-MAC nicht in der Tabelle steht?
* Flooding an alle Ports außer dem Eingangsport
- Verwerfen
- Senden nur an den Uplink
- Rückmeldung an den Absender mit Fehler
? Welche Länge hat die FCS im Ethernet-Frame?
* 4 Byte
- 2 Byte
- 6 Byte
- 8 Byte
? Ab welcher Ethernet-Geschwindigkeit gibt es ausschließlich Switched Ethernet?
* 10 Gigabit Ethernet
- Fast Ethernet
- Ethernet 10 Mbit/s
- Gigabit Ethernet über Kupfer
? Was verursacht ein Duplex-Mismatch typischerweise?
* Late Collisions und CRC-Fehler
- Eine Spanning-Tree-Schleife
- Einen DHCP-Fehler
- Einen VLAN-Wechsel
! Eine Seite Halb-, die andere Vollduplex: Die Halbduplex-Seite erkennt Kollisionen zu spät.
@ Obsidian: OSI 2/Ethernet, CSMA-CD
