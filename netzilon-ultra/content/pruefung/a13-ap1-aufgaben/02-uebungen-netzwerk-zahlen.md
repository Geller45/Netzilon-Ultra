---
id: ap1-uebung-netz-zahlen
bereich: Prüfung
block: A13
kapitel: AP1-Aufgaben
titel: AP1-Übungen: Subnetting, IPv6, Zahlensysteme, Einheiten (eigene Aufgaben mit Lösung)
stufe: Fortgeschritten
typ: uebung
quellen: [Eigene Übungsaufgaben im AP1-Stil, alle Lösungen nachgerechnet]
verweise: [ap1-a4-subnetting, ap1-a4-ipv6, ap1-a3-zahlensysteme, ap1-a3-zweierkomplement, ap1-a3-binaerpraefixe]
---

## Profi

**Hinweis:** Das sind **eigene Übungsaufgaben** im Stil der AP1, keine Original-Prüfungsaufgaben. Rechenwege stehen in den Lösungen.

### Formelsammlung
| Thema | Formel/Regel |
|---|---|
| Hosts je Subnetz | **2^n − 2** (n = Hostbits) |
| Blockgröße | **256 − letztes Maskenoktett** (z. B. 256 − 192 = 64) |
| Subnetzanzahl beim Teilen | **2^s** (s = geliehene Bits) |
| Dezimal → Dual | fortlaufend durch 2 teilen oder Stellenwerte 128, 64, 32, 16, 8, 4, 2, 1 abziehen |
| Zweierkomplement | **Invertieren + 1** |
| Übertragungszeit | **Datenmenge in bit ÷ Datenrate in bit/s** |
| Hersteller-GB vs. GiB | **1 GB = 10^9 Byte**, **1 GiB = 2^30 Byte** |

## Einfach

Rechenaufgaben sind wie **Kuchenverteilen**: Ein /24-Netz ist ein Kuchen mit 256 Stücken. Wenn du ihn in **vier Teile** schneidest (2 Bits mehr für das Netz), hat jedes Stück **64** Stücke, aber **zwei** davon sind **nicht essbar** (Netz- und Broadcastadresse). Deshalb bleiben **62** nutzbar. Bei Dualzahlen zählst du nicht bis 10, sondern **bis 2**: jede Stelle ist **doppelt so viel wert** wie die rechte daneben (1, 2, 4, 8, 16 …).

## Merksatz
- **Blockgröße = 256 − Maskenwert**.
- **Nutzbare Hosts = 2^n − 2**.
- **Zweierkomplement = invertieren + 1**.
- **bit = Bytes × 8**.
- **Hersteller-Speicher (GB) < GiB-Anzeige** (Faktor 1,0737).

## Prüfungsfalle
- **Netz- und Broadcastadresse** sind **nicht** nutzbar.
- **Mbit/s** ≠ **MB/s** (Faktor 8).
- **Ergebnis mit Gateway**: Das Gateway **verbraucht** eine Hostadresse.
- **Zweierkomplement**: Das **höchste Bit** ist das **Vorzeichenbit**.

## Grafik
### Kuchen teilen
Ein Kuchen mit 256 Stücken; ein Regler wählt /24 bis /30, die Stücke färben sich (Netzadresse, nutzbar, Broadcast).

### Stellenwertbrett
Acht Schalter (128 … 1), Klick schaltet Bits und zeigt Dezimal und Hex live.

## Übungen
- A: Netzadresse, Broadcast und Hostbereich von 172.16.45.130/26? | L: Blockgröße 64, 130 liegt in 128–191: Netz 172.16.45.128, Broadcast 172.16.45.191, Hosts 172.16.45.129 bis .190 (62).
- A: Wie viele nutzbare Hosts hat ein /20? | L: 32 − 20 = 12 Hostbits, 2^12 − 2 = 4094.
- A: Teile 192.168.100.0/24 in mindestens 6 gleich große Subnetze. Maske, Hosts je Subnetz? | L: 6 → 8 Subnetze (3 Bits), Präfix /27, Maske 255.255.255.224, je 30 Hosts.
- A: VLSM mit 192.168.5.0/24 für 100, 50, 25 und 10 Hosts (größte zuerst). | L: 100 → 192.168.5.0/25 (126), 50 → 192.168.5.128/26 (62), 25 → 192.168.5.192/27 (30), 10 → 192.168.5.224/28 (14).
- A: Liegt 10.20.30.40 im Netz 10.20.28.0/22? | L: /22 → Blockgröße 4 im 3. Oktett, Netz 10.20.28.0 bis 10.20.31.255; 30 liegt darin: ja.
- A: Ein PC hat 192.168.1.130/25 und das Gateway 192.168.1.1. Warum funktioniert das nicht? | L: /25 → PC im Netz 192.168.1.128–.255; das Gateway .1 liegt in 192.168.1.0/25, also in einem anderen Subnetz, nicht direkt erreichbar.
- A: Schreibe 2001:0DB8:0000:0000:0008:0800:200C:417A kurz. | L: 2001:db8::8:800:200c:417a (führende Nullen weg, eine Null-Folge durch :: ersetzt).
- A: Wie viele /64-Subnetze passen in ein /48? | L: 64 − 48 = 16 Bit, 2^16 = 65 536.
- A: Wandle 203 (dezimal) in Dual und Hex um. | L: 128+64+8+2+1 = 11001011 (Dual), 0xCB (Hex).
- A: Wandle 0xB7 in Dezimal und Dual um. | L: 11·16 + 7 = 183; Dual 1011 0111.
- A: Addiere 10110110 und 01011011 (8 Bit). Was passiert? | L: 182 + 91 = 273 → 1 0001 0001; in 8 Bit bleibt 00010001 (17) mit Übertrag (Überlauf).
- A: Stelle −45 im Zweierkomplement mit 8 Bit dar. | L: 45 = 00101101, invertiert 11010010, +1 = 11010011 (0xD3).
- A: Eine Festplatte hat laut Hersteller 500 GB. Wie viel GiB zeigt das Betriebssystem ungefähr? | L: 500·10^9 ÷ 2^30 ≈ 465,7 GiB.
- A: Wie lange dauert die Übertragung von 2 GB (1 GB = 10^9 Byte) bei 100 Mbit/s ohne Overhead? | L: 2·10^9·8 = 16·10^9 bit ÷ 100·10^6 bit/s = 160 s.

## Quiz
? Wie viele nutzbare Hosts hat ein /26?
* 62
- 64
- 30
- 126

? Was ergibt −45 im 8-Bit-Zweierkomplement?
* 11010011
- 10101101
- 11010010
- 00101101

? Welche Blockgröße hat die Maske 255.255.255.224?
* 32
- 16
- 64
- 224

? Wie viele /64-Subnetze hat ein /48?
* 65 536
- 256
- 4096
- 16

? Wie viele GiB entsprechen ungefähr 500 GB laut Hersteller?
* 465,7
- 500
- 512
- 536,9
