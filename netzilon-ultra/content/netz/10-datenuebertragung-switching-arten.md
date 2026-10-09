---
id: netz-datenuebertragung-switching
bereich: AP1
block: Netzwerk
kapitel: Datenübertragung
titel: Datenübertragungstechnik – Kenngrößen, Übertragungsarten, Adressierung, Leitungs- und Paketvermittlung
stufe: Einsteiger
fach: ITK / Grundlagen
pruefungen: [AP1, CCNA, Schule]
quellen: [Datenübertragungstechnik.md, Switching Types.md]
verweise: [netz-ethernet-csma-cd-frame, ap1-a4-netzwerkgrundlagen, ccna-kabel-schnittstellen, ccna-ipv6-typen-ndp]
---

## Profi

### Kenngrößen
| Größe | Einheit | Formel / Bemerkung |
|---|---|---|
| Datenmenge **D** | Bit, Byte (1 Byte = 8 Bit) | Dateigröße |
| Zeit **t** | s | Zeitraum |
| Datenübertragungsrate **C** | Bit/s, Byte/s | **C = D / t** |
| Geschwindigkeit **v** | km/h, m/s | v = s / t |
| Lichtgeschwindigkeit im Vakuum | m/s | 299 792 458 m/s ≈ **3 · 10⁸ m/s** |
| Verkürzungsfaktor **NVP** | – | NVP = c / l; Kupfer 0,6 … 0,85 |
| Signalgeschwindigkeit Kupfer | m/s | c = l · NVP, typisch ⅔ Lichtgeschwindigkeit ≈ **2 · 10⁸ m/s** |
| Brechungsindex Glasfaser **n** | – | n = l / c, typisch 1,4 … 1,5 |
| Signalgeschwindigkeit LWL | m/s | ca. 2 · 10⁸ m/s |
| Bandbreite **B** | Hz | obere minus untere Grenzfrequenz |
(Hinweis: In der Quelle ist „NVP = c / l“ und „n = l / c“ mit c als Signalgeschwindigkeit im Medium und l als Lichtgeschwindigkeit notiert. Üblich ist NVP = v_Medium / c₀ und n = c₀ / v_Medium; die Quelle verwendet vertauschte Buchstaben, die Zahlenwerte stimmen.)

### Rechnen
- **Übertragungsrate:** C = D / t
- **Übertragungszeit:** t = D / C
- Beispiel: 600 MB über 100 Mbit/s: 600 · 8 = 4800 Mbit → t = 4800 / 100 = **48 s** (ideal, ohne Protokoll-Overhead).
- **Laufzeit (Latenz)** einer Leitung: t = Länge / Signalgeschwindigkeit; 100 m Kupfer: 100 m / 2·10⁸ m/s = **0,5 µs**.

### Übertragungsarten
| Art | Beschreibung | Beispiel |
|---|---|---|
| **Seriell** | Bits nacheinander | USB, SATA, Ethernet |
| **Parallel** | mehrere Bits (8, 16, 32 …) gleichzeitig | alte Druckerschnittstelle |
| **Simplex** | nur eine Richtung | Rundfunk (Radio) |
| **Halbduplex** | beide Richtungen, aber abwechselnd | Walkie-Talkie |
| **Vollduplex** | beide Richtungen gleichzeitig | Telefon, Switched Ethernet |
| **Multiplex** | mehrere Kanäle teilen ein Medium: **Zeit-**, **Frequenz-**, **Wellenlängenmultiplex** | Mehrfachnutzung von Leitungen, WDM auf Glasfaser |

### Adressierung im Netzwerk
| Typ | Beschreibung |
|---|---|
| **Unicast** | ein Sender → ein Empfänger |
| **Multicast** | ein Sender → eine Gruppe |
| **Broadcast** | ein Sender → alle im Netzsegment (nur IPv4) |
| **Anycast** | ein Sender → ein beliebiger (nächster) Empfänger einer Gruppe |

### Vermittlungsarten (Switching Types)
- **Leitungsvermittlung (Circuit Switching):** Vor der Übertragung wird ein **fester, exklusiver Kanal** zwischen Sender und Empfänger aufgebaut. Daten folgen immer demselben Weg, **kein Routing**. Verwendung: klassische Telefonie. Nachteil: Kanal bleibt belegt, auch wenn nicht gesprochen wird.
- **Paketvermittlung (Packet Switching):** Daten werden in **Pakete** zerlegt (Header + Payload). Jedes Paket kann einen **anderen Weg** nehmen, es gibt **Routing**. Verwendung: Internet, IP-Netze. Vorteil: bessere Auslastung; Nachteil: Reihenfolge und Laufzeit schwanken, Pakete müssen am Ziel zusammengesetzt werden.

## Einfach

Daten sind wie **Wasser in einem Rohr**. Die **Datenmenge** ist, wie viel Wasser du hast, die **Übertragungsrate**, wie viel pro Sekunde durch das Rohr passt. Willst du wissen, wie lange es dauert: Menge geteilt durch Rate. Aufpassen: Eine Datei misst man oft in **Byte**, die Leitung in **Bit pro Sekunde**. 1 Byte sind 8 Bit, also immer erst umrechnen!

Wie wird gesprochen? **Simplex** ist wie Radio: Du hörst nur zu. **Halbduplex** ist wie Walkie-Talkie: Immer nur einer redet, dann sagt er „Ende“. **Vollduplex** ist wie Telefon: Beide dürfen gleichzeitig reden.

An wen geht die Nachricht? **Unicast** ist ein Brief an eine Person, **Multicast** ein Brief an eine Gruppe (z. B. Klassen-Chat), **Broadcast** ein Ruf durch die ganze Halle, **Anycast** ein Ruf „Ich brauche irgendwen von euch, der am nächsten ist“.

Und wie kommen die Daten an? Früher beim Telefon wurde **eine feste Leitung nur für euch zwei** geschaltet (Leitungsvermittlung) – so wie eine private Straße, die für niemand anderen frei ist. Im Internet wird alles in kleine **Päckchen** zerlegt, und jedes Päckchen sucht sich selbst den besten Weg (Paketvermittlung) – wie Autos, die an einer Kreuzung je nach Stau verschiedene Straßen nehmen. Am Ziel werden sie wieder richtig zusammengesetzt.

## Merksatz
- **C = D / t, t = D / C – immer Byte × 8 = Bit!**
- **Signal in Kupfer und Glas ≈ ⅔ Lichtgeschwindigkeit ≈ 2 · 10⁸ m/s.**
- **Simplex = Radio, Halbduplex = Funkgerät, Vollduplex = Telefon.**
- **Leitungsvermittlung = fester Weg, kein Routing. Paketvermittlung = Routing, Header + Payload.**
- **Broadcast gibt es nur in IPv4.**

## Prüfungsfalle
- **Bit vs. Byte:** Leitung in Mbit/s, Datei in MB → mit 8 multiplizieren. Und bei „Mbit/s → MB/s“ durch 8 teilen.
- Dezimal- vs. Binärpräfixe: 1 MB = 10⁶ Byte, 1 MiB = 2²⁰ Byte.
- In der Quelle ist die Zeile „Multiplex“ mit „Übertragung in beide Richtungen gleichzeitig“ beschrieben – gemeint ist die **Mehrfachnutzung eines Mediums** durch mehrere Kanäle, nicht Duplex.
- **Halbduplex ≠ Simplex:** Halbduplex nutzt beide Richtungen, nur nicht gleichzeitig.
- **Anycast ≠ Multicast:** Anycast geht an **einen** Empfänger (den nächsten), Multicast an **alle** Gruppenmitglieder.
- Echte Datenrate liegt wegen Header, Fehlerkorrektur und Wartezeiten unter der Nennrate.

## Grafik
### Leitungs- vs. Paketvermittlung
1. Anrufer: Möchte Anrufer 2 sprechen
2. Anrufer -> Vermittlung: Verbindungsaufbau (Kanal reservieren)
3. Vermittlung -> Anrufer 2: Fester Kanal steht, alle Daten nehmen denselben Weg
4. Sender: Daten in Pakete zerlegen (Header + Payload)
5. Sender -> Router-A: Paket 1
6. Sender -> Router-B: Paket 2 (anderer Weg)
7. Router-A -> Empfänger: Paket 1 zugestellt
8. Router-B -> Empfänger: Paket 2 zugestellt, Empfänger setzt zusammen

### Übertragungszeit
1. Text: Datei 600 MB × 8 = 4800 Mbit
2. Text: Leitung 100 Mbit/s
3. Text: t = D / C = 4800 / 100 = 48 s

## Lab
### Cisco IOS
Gerät: **R1** (Router) und **SW1**. Schnittstellenkenngrößen auslesen.
```
R1> enable
R1# show interfaces gigabitEthernet 0/0
R1# configure terminal
R1(config)# interface gigabitEthernet 0/0
R1(config-if)# bandwidth 100000
R1(config-if)# delay 10
R1(config-if)# end
R1# show interfaces gigabitEthernet 0/0 | include BW|DLY|duplex|rate
R1# show interfaces serial 0/0/0
```
`BW` (Kbit/s) und `DLY` (µs) sind Kenngrößen, aus denen Routing-Metriken (z. B. EIGRP, OSPF-Cost) berechnet werden; `bandwidth` ändert nur den **Rechenwert**, nicht die echte Geschwindigkeit. Die Zeile *input rate / output rate* zeigt die tatsächliche Datenrate (bit/sec).
### Messen auf dem PC (Windows)
```
ping -n 20 192.168.10.1
```
Die Antwortzeit (Latenz) liegt im LAN bei < 1 ms; Verlust und Schwankung zeigen Überlast.

## Befehle
- `show interfaces g0/0` – BW, DLY, Duplex, Datenrate in/out
- `bandwidth <kbit/s>` – Referenzbandbreite für Metriken setzen
- `delay <10 µs>` – Verzögerungswert setzen
- `show interfaces status` – Speed/Duplex je Port
- `ping -n 20 <ip>` – Latenz und Verlust messen

## Übungen
- A: Wie lange dauert die Übertragung von 600 MB bei 100 Mbit/s (ideal)? | L: 600 · 8 = 4800 Mbit; t = 4800 / 100 = 48 s.
- A: Welche Rate in MB/s entspricht 1 Gbit/s? | L: 1000 Mbit/s / 8 = 125 MB/s.
- A: Wie lange braucht ein Signal für 200 m Kupfer? | L: 200 / 2·10⁸ = 1 µs.
- A: Nenne je ein Beispiel für Simplex, Halbduplex, Vollduplex. | L: Radio; Walkie-Talkie; Telefon.
- A: Welche Multiplexverfahren gibt es? | L: Zeit-, Frequenz- und Wellenlängenmultiplex.
- A: Unterschied Leitungs- und Paketvermittlung? | L: Leitung: fester exklusiver Weg, kein Routing (Telefon). Paket: Pakete mit Header + Payload, eigener Weg je Paket, Routing (Internet).
- A: Welche Adressierungsart gibt es nur in IPv4? | L: Broadcast.

## Karteikarten
- F: Formel Datenübertragungsrate? | A: C = D / t
- F: Formel Übertragungszeit? | A: t = D / C
- F: Lichtgeschwindigkeit im Vakuum (gerundet)? | A: 3 · 10⁸ m/s.
- F: Signalgeschwindigkeit in Kupfer/Glasfaser? | A: ca. ⅔ der Lichtgeschwindigkeit, rund 2 · 10⁸ m/s.
- F: Typischer Brechungsindex von Glasfaser? | A: 1,4 bis 1,5.
- F: Wert des NVP bei Kupferleitungen? | A: 0,6 bis 0,85.
- F: Wie viele Bit hat ein Byte? | A: 8.
- F: Was ist Halbduplex? | A: Beide Richtungen, aber abwechselnd (Walkie-Talkie).
- F: Was ist Vollduplex? | A: Beide Richtungen gleichzeitig (Telefon).
- F: Nenne die drei Multiplexverfahren. | A: Zeit-, Frequenz-, Wellenlängenmultiplex.
- F: Was ist Anycast? | A: Zustellung an einen beliebigen/nächsten Empfänger einer Gruppe.
- F: Welche Vermittlung nutzt das Telefon klassisch? | A: Leitungsvermittlung (Circuit Switching).
- F: Aus was besteht ein Paket? | A: Header + Payload.

## Quiz
? Welche Formel gilt für die Übertragungszeit?
* t = D / C
- t = D · C
- t = C / D
- t = D + C
? Wie viele Sekunden dauert die ideale Übertragung von 100 MB über 100 Mbit/s?
* 8 s
- 1 s
- 10 s
- 80 s
? Welche Übertragungsart ist das klassische Telefon?
* Vollduplex
- Simplex
- Halbduplex
- Parallel
? Walkie-Talkie ist ein Beispiel für…
* Halbduplex
- Simplex
- Vollduplex
- Multiplex
? Welche Vermittlungsart kennt kein Routing und nutzt einen festen Kanal?
* Leitungsvermittlung
- Paketvermittlung
- Zellvermittlung mit Routing
- Nachrichtenvermittlung
? Wie ist ein Paket in der Paketvermittlung aufgebaut?
* Header + Payload
- Nur Payload
- Preamble + FCS
- Trailer + Jam
? Welches Verfahren teilt Kanäle auf Glasfaser über Lichtfarben auf?
* Wellenlängenmultiplex
- Zeitmultiplex
- Frequenzmultiplex im Kupfer
- Codemultiplex
? Wie schnell ist ein Signal in Kupfer etwa?
* ca. 2 · 10⁸ m/s
- ca. 3 · 10⁸ m/s
- ca. 3 · 10⁵ m/s
- ca. 1 · 10⁹ m/s
? Welche Adressierungsart gibt es in IPv6 nicht mehr?
* Broadcast
- Unicast
- Multicast
- Anycast
? Wofür steht NVP?
* Nominal Velocity of Propagation (Verkürzungsfaktor)
- Network Virtual Path
- Nominal Voltage Power
- Node Value Protocol
@ Obsidian: Datenübertragungstechnik, Switching Types
