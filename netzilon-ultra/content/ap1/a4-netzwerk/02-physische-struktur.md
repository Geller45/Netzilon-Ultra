---
id: ap1-a4-topologie
bereich: AP1
block: A4
kapitel: Netzwerk
titel: Physische Netzwerkstruktur – Medien, Geräte, Domänen
stufe: Einsteiger
quellen: [01-Folien-physische-Netzwerktopologie.pdf, uebung-Physische-Netzwerkstruktur.pdf]
verweise: [ap1-a4-netzwerkgrundlagen, ap1-a4-vlan, ap1-a2-netzteil]
---

## Profi

### Übertragungsmedien
| | **Kupfer (Twisted Pair)** | **Glasfaser (LWL)** | **WLAN** |
|---|---|---|---|
| Geschwindigkeit | 10 Mbit/s – 10 Gbit/s (Cat 6A), 25/40 Gbit/s (Cat 8, 30 m) | 1 – 400+ Gbit/s | aktuell Wi-Fi 6/6E/7: theoretisch 1–46 Gbit/s, real deutlich weniger |
| Reichweite | **100 m** (90 m Festverkabelung + 10 m Patch) | Multimode ca. 300–550 m, **Singlemode bis 40 km und mehr** | 30–100 m, stark gebäudeabhängig |
| Störanfälligkeit | anfällig gegen **elektromagnetische Störungen** (EMV) | **unempfindlich**, keine Erdungsprobleme (Potenzialtrennung), abhörsicherer | Interferenzen, **nicht abhörsicher** ohne Verschlüsselung (WPA3) |
| Kosten/Verlegung | günstig, robust, einfach | teurer, empfindlich (Biegeradius), Spleißen/Stecker aufwendig | keine Kabel, aber Access Points nötig |
| Einsatz (strukturierte Verkabelung) | **Tertiärbereich** (Etage → Arbeitsplatz), teils Sekundär | **Primär** (Gebäude ↔ Gebäude) und **Sekundär** (Steigbereich zwischen Etagen) | Tertiärbereich, mobile Geräte |

**Strukturierte Verkabelung (EN 50173)**: **Primärbereich** (Campus, Gebäude verbinden), **Sekundärbereich** (vertikal, Etagenverteiler), **Tertiärbereich** (horizontal, Etagenverteiler → Anschlussdose).

**Kupfer-Kategorien**: Cat 5e (1 Gbit/s), Cat 6 (1 Gbit/s, 10 Gbit/s bis 55 m), **Cat 6A (10 Gbit/s, 100 m)**, Cat 7/7A (Verlegekabel), Cat 8 (25/40 Gbit/s, 30 m). Schirmung: **U/UTP** (ungeschirmt), F/UTP, **S/FTP** (Gesamt- und Paarschirm).

**WLAN-Betriebsarten**: **Ad-hoc** (direkte, vorübergehende Verbindung zweier Geräte ohne Access Point) und **Infrastruktur-Modus** (Verbindung über **Access Point**, Standard in Unternehmen).

### Ethernet-Standards
| Name | Bezeichnung | Kabel | Geschwindigkeit | max. Segmentlänge |
|---|---|---|---|---|
| Standard Ethernet | 10BASE-T | UTP Cat 3 | 10 Mbit/s | 100 m |
| Fast Ethernet | 100BASE-TX | Cat 5 | 100 Mbit/s | 100 m |
| Gigabit Ethernet | 1000BASE-T | Cat 5e | 1 Gbit/s | 100 m |
| Gigabit Ethernet | 1000BASE-SX / -LX | Multimode / Singlemode LWL | 1 Gbit/s | 550 m / 5 km (bis ca. 10 km) |
| 2,5/5G Ethernet | 2.5GBASE-T/5GBASE-T | Cat 5e/6 | 2,5/5 Gbit/s | 100 m |
| 10G Ethernet | 10GBASE-T / -SR / -LR | Cat 6A / LWL | 10 Gbit/s | 100 m / 300 m / 10 km |
Aufbau des Namens: Geschwindigkeit – **BASE** (Basisband) – Medium (T = Twisted Pair, S = short wave, L = long wave).

### Netzwerktypen und Zugriffsverfahren
- **Ethernet** (IEEE 802.3): Kupfer oder Glasfaser, heute Standard. Ursprünglich **CSMA/CD**.
- **Token Ring** (IEEE 802.5): veraltet. Ein **Token** kreist; nur wer es besitzt, darf senden → **keine Kollisionen möglich** (in Ethernet mit Hubs dagegen üblich).
- **WLAN** (IEEE 802.11) verwendet **CSMA/CA** (Collision Avoidance), da Funkgeräte Kollisionen nicht zuverlässig erkennen können.

**CSMA/CD** (Carrier Sense Multiple Access / Collision Detection):
1. **Carrier Sense** – auf die Leitung horchen.
2. Leitung **frei** → senden; sonst Schritt 5.
3. **Weiter horchen** – bei Kollision **Jam-Signal** senden und Senden abbrechen.
4. Sendung erfolgreich beendet.
5. Leitung belegt – eine **zufällige Zeit warten** (Backoff) und erneut versuchen.
6. Leitung frei geworden → zurück zu 1.
7. Nach der **maximalen Anzahl an Versuchen** (16) Abbruch mit Fehler.
Heute mit Switches und **Vollduplex** praktisch bedeutungslos – jede Verbindung Switch ↔ Gerät ist eine eigene Kollisionsdomäne, Senden und Empfangen gleichzeitig.

### Netzwerkgeräte
| Gerät | OSI | DoD | Funktion | Kollisionsdomänen | Broadcastdomänen |
|---|---|---|---|---|---|
| **Hub** (Repeater) | 1 | 1 Network Access | leitet jedes Signal an **alle** Ports weiter (logischer Bus) | **eine** gemeinsame | eine |
| **Bridge** | 2 | 1 Network Access | verbindet zwei Segmente, filtert anhand von MAC-Adressen | **teilt** in zwei | eine |
| **Switch** | 2 | 1 Network Access | Multiport-Bridge; lernt MAC-Adressen (**MAC-Tabelle/CAM**) und sendet Frames **nur zum Empfänger** (Stern) | **jeder Port eine eigene** | eine (ohne VLANs) |
| **Router** | 3 | 2 Internet | verbindet **verschiedene Netze**, wählt Wege anhand von IP-Adressen, **leitet keine Broadcasts weiter**, oft „Gateway“ genannt | jeder Port eigene | **jeder Port eigene** |
| Layer-3-Switch | 2 + 3 | 1 + 2 | Switch mit Routing-Funktion (Inter-VLAN-Routing) | je Port | je VLAN |
| Access Point | 2 | 1 | Übergang WLAN ↔ LAN | | |

- **Broadcastdomäne**: Gruppe von Geräten, die einen **Broadcast** eines Mitglieds empfangen. Grenze: **Router** (und VLANs).
- **Kollisionsdomäne**: Gruppe von Geräten, bei denen eine **Kollision** entsteht, wenn zwei gleichzeitig senden. Grenze: **Bridge, Switch, Router** (jeder Port).

### Topologien
| Topologie | Merkmal | Vorteil | Nachteil |
|---|---|---|---|
| Bus | alle an einem Kabel | günstig | Kabelbruch legt alles lahm, Kollisionen |
| Ring | jeder mit zwei Nachbarn | deterministisch (Token) | Ausfall eines Knotens stört Ring (ohne Doppelring) |
| **Stern** | alle an zentralem Switch | Ausfall eines Kabels betrifft nur ein Gerät, leicht erweiterbar | zentraler Switch = Single Point of Failure |
| Baum/erweiterter Stern | hierarchisch verbundene Sterne | Standard in Unternehmen (Core – Distribution – Access) | Ausfall eines oberen Knotens betrifft ganzen Zweig |
| Vermascht (Mesh) | mehrere Wege | hohe Ausfallsicherheit | teuer, komplex (Internet, WAN, Mesh-WLAN) |
**Physische** Topologie = wie verkabelt ist; **logische** = wie die Daten fließen (Hub: physisch Stern, logisch Bus).

## Übungen
- A: Was kann in einem Token-Ring-Netz nicht passieren, ist im Ethernet (mit Hubs) üblich? | L: Kollisionen – nur der Tokenbesitzer darf senden.
- A: Broadcastdomäne erklären | L: Alle Geräte, die einen Broadcast eines Geräts empfangen; Grenze ist der Router.
- A: Kollisionsdomäne erklären | L: Alle Geräte, deren gleichzeitiges Senden eine Kollision erzeugt; Grenze sind Bridge, Switch, Router.
- A: Welche Geräte teilen ein Netz in Broadcastdomänen? | L: Router (und Layer-3-Switches; logisch auch VLANs).
- A: Je 2 Vor- und Nachteile Glasfaser gegenüber Kupfer | L: Vorteile: große Reichweite/Bandbreite, unempfindlich gegen EMV und abhörsicherer. Nachteile: teurer, aufwendige Verlegung/Konfektionierung (Biegeradius, Spleißen).
- A: Netzwerkgeräte den DoD-Schichten zuordnen | L: Hub, Switch, Bridge → 01 Network Access; Router → 02 Internet.
- A: Abbildung (3 Etagen, je Hub mit 5 PCs am Router, Router über Backbone verbunden): Broadcastdomänen? | L: 4 (drei Etagensegmente + Backbone)
- A: Broadcastdomänen, wenn Hubs durch Switches ersetzt werden? | L: weiterhin 4 – Switches trennen keine Broadcastdomänen
- A: Kollisionsdomänen mit Hubs? | L: 4 (jedes Hub-Segment eine + Backbone)
- A: Kollisionsdomänen mit Switches? | L: 19 – je Switch 6 Ports (5 PCs + Router-Uplink) × 3 = 18, plus Backbone = 19

## Einfach

**Kabel-Arten**:
- **Kupferkabel** ist wie ein **Gartenschlauch**: billig, leicht zu verlegen, aber nur für kurze Strecken (100 m). Und wenn daneben ein starker Motor läuft, „zittert“ das Signal (Störungen).
- **Glasfaser** ist wie eine **Wasserleitung aus Licht**: Das Signal ist ein Lichtstrahl, der durch ein haarfeines Glasröhrchen saust. Kilometerweit, super schnell, von Strom und Motoren völlig unbeeindruckt. Aber teuer und empfindlich – nicht knicken!
- **WLAN** ist wie **Rufen durch den Raum**: keine Kabel, praktisch – aber jeder in der Nähe kann mithören (deshalb verschlüsseln!), und Wände schlucken das Signal.

**Die Geräte**:
- Ein **Hub** ist ein **Lautsprecher**: Was einer sagt, hören alle. Reden zwei gleichzeitig, versteht keiner etwas (**Kollision**).
- Ein **Switch** ist ein **schlauer Postbote**: Er merkt sich, wer wo wohnt (MAC-Tabelle), und bringt jede Nachricht nur zum richtigen Empfänger. Keine Kollisionen mehr.
- Ein **Router** ist die **Grenzkontrolle zwischen zwei Städten** (Netzen): Er entscheidet, welcher Weg in die andere Stadt führt. Und: **Durchsagen** (Broadcasts) lässt er nicht durch – die bleiben in der eigenen Stadt.

**Broadcastdomäne** = alle, die eine **Lautsprecherdurchsage** hören. Endet am Router.
**Kollisionsdomäne** = alle, die sich **gegenseitig ins Wort fallen** können. Bei einem Switch hat jeder seine eigene „Leitung“ – keiner fällt dem anderen ins Wort.

**CSMA/CD** ist wie gute Manieren beim Reden: Erst **zuhören**, ob jemand spricht. Wenn nicht: reden. Fangen zwei gleichzeitig an: beide **still**, kurz **zufällig lange warten** und nochmal versuchen.

**Token Ring**: Es gibt einen **Sprechstab** (Token). Nur wer den Stab hat, darf reden – deshalb redet nie jemand durcheinander.

## Merksatz
- **Hub = 1, Switch/Bridge = 2, Router = 3** (OSI).
- **Router trennt Broadcast**, **Switch trennt Kollision**.
- Kupfer **100 m**, Glasfaser **km**.
- CSMA/**CD** = Kabel (Detection), CSMA/**CA** = WLAN (Avoidance).
- Primär = Gebäude ↔ Gebäude, Sekundär = Etagen, Tertiär = Arbeitsplatz.

## Prüfungsfalle
- Switches trennen **keine** Broadcastdomänen (ohne VLANs).
- Bridge: teilt Kollisions-, aber nicht Broadcastdomänen.
- Router-Ports zählen bei Kollisionsdomänen mit (Uplink zum Switch).
- Twisted-Pair-Länge 100 m gilt für den gesamten Link (inkl. Patchkabel).
- WLAN nutzt CSMA/CA, nicht CD.

## Grafik
### Hub vs. Switch vs. Router
Drei Szenen mit je vier PCs. Ein PC sendet: Beim Hub leuchten alle Kabel, bei gleichzeitigem Senden zweier PCs gibt es einen roten Kollisionsblitz. Beim Switch leuchtet nur der Weg zum Empfänger. Beim Router bleibt ein Broadcast (Lautsprecher-Symbol) an der Netzgrenze hängen.

### Domänen-Zähler
Die Prüfungsabbildung (3 Etagen) mit farbigen Flächen für Broadcast- und Kollisionsdomänen; Schalter „Hubs → Switches“ teilt die Kollisionsdomänen sichtbar auf, Zähler springt von 4 auf 19.

### CSMA/CD-Ablauf
Zwei Stationen am Bus, Signal läuft, Kollision in der Mitte, Jam-Signal, zufällige Wartezeit (Würfel), erneuter Versuch.

### Glasfaser
Lichtstrahl, der im Kern durch Totalreflexion hin- und herspringt; daneben Kupferkabel mit Störblitzen von einem Motor.

## Karteikarten
- F: Maximale Länge eines Twisted-Pair-Ethernet-Links? | A: 100 m.
- F: Zwei Vorteile von Glasfaser? | A: Große Reichweite/Bandbreite; unempfindlich gegen elektromagnetische Störungen.
- F: Was ist eine Broadcastdomäne? | A: Alle Geräte, die einen Broadcast empfangen – begrenzt durch Router.
- F: Was ist eine Kollisionsdomäne? | A: Alle Geräte, bei denen gleichzeitiges Senden eine Kollision verursacht – begrenzt durch Switch/Bridge/Router.
- F: Auf welcher OSI-Schicht arbeitet ein Hub? | A: Schicht 1 (Bitübertragung).
- F: Was lernt ein Switch? | A: Welche MAC-Adresse an welchem Port hängt (MAC-/CAM-Tabelle).
- F: Warum gibt es bei Token Ring keine Kollisionen? | A: Nur der Besitzer des Tokens darf senden.
- F: Ablauf CSMA/CD kurz? | A: Horchen – bei freier Leitung senden – bei Kollision Jam-Signal, zufällig warten, erneut versuchen.
- F: Was bedeutet 1000BASE-T? | A: 1 Gbit/s, Basisband, Twisted Pair.
- F: Unterschied Ad-hoc- und Infrastrukturmodus? | A: Ad-hoc: direkte Verbindung zweier Geräte. Infrastruktur: über einen Access Point.
- F: Was ist der Tertiärbereich? | A: Horizontale Verkabelung vom Etagenverteiler zum Arbeitsplatz.

## Quiz
? Welches Gerät begrenzt Broadcastdomänen?
* Router
- Switch
- Hub
- Bridge

? Ein Switch hat 24 belegte Ports. Wie viele Kollisionsdomänen entstehen?
* 24
- 1
- 2
- 12

? Welches Medium ist am wenigsten anfällig für elektromagnetische Störungen?
* Glasfaser
- U/UTP-Kupferkabel
- WLAN
- Koaxialkabel

? Welches Zugriffsverfahren nutzt WLAN?
* CSMA/CA
- CSMA/CD
- Token Passing
- Polling

? Welche Aussage zum Hub ist richtig?
* Er leitet empfangene Signale an alle Ports weiter
- Er leitet Frames nur an den Zielport weiter
- Er trennt Broadcastdomänen
- Er arbeitet auf OSI-Schicht 3

? Welche Topologie hat ein typisches Ethernet-LAN mit Switches?
* Stern (bzw. erweiterter Stern)
- Ring
- Bus
- Vollvermascht
! Jedes Endgerät hat eine eigene Leitung zum Switch.

? Wie lang darf ein Twisted-Pair-Link (Kupfer) nach Ethernet-Standard maximal sein?
* 100 m
- 500 m
- 10 m
- 2 km
! 90 m Installationskabel plus Patchkabel.

? Welches Gerät arbeitet auf Schicht 2 und lernt MAC-Adressen?
* Switch
- Hub
- Repeater
- Router
! Der Switch leitet Frames gezielt anhand seiner MAC-Tabelle weiter.
