---
id: ihk-berechnungen-lernzettel
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: Berechnungen – RAID, Subnetting, IPv6, Datentransfer, Strom, USV, Verfügbarkeit
stufe: Fortgeschritten
fach: PV – AP1
pruefungen: [AP1, AP2]
quellen: [Berechnungen.docx, Berechnungen.pdf, 1 Lernzettel Zusammenfassung.docx, Ergänzung Lernzettel.docx, USV & Stromversorgung.docx, IPv4-IPv6 Subnetting.docx, Lernzettel_AP1AP2_2024.pdf]
verweise: [ihk-kalkulation, ihk-lernzettel-guide, ihk-fehleranalyse]
---

## Profi

### 1. RAID-Nettokapazität
RAID 5: (n−1)·C; RAID 6: (n−2)·C; RAID 10: n/2·C; RAID 1: C; RAID 0: n·C; **RAID 15**: erst RAID-1-Paare (Spiegel), darauf RAID 5. Beispiel RAID 15 mit 6 Platten à 2 TB: 3 Paare → 3 Einheiten à 2 TB → RAID 5: (3−1)·2 = 4 TB. **Hot-Spare** zuerst abziehen: 8 Platten, 1 Spare, RAID 5: (7−1)·C.
Vorgehen: n und C bestimmen → Level → Verlustplatten abziehen → multiplizieren.

### 2. IPv4-Subnetting
Hosts = 2ʰ − 2 (h = Host-Bits). Maske aus CIDR: /26 → 26 Einsen → 255.255.255.192. Blockgröße = 256 − letztes Oktett der Maske (hier 64).
Beispiel 192.168.10.77/26: Netz-ID 192.168.10.64, Broadcast 192.168.10.127, nutzbar .65–.126 (62 Hosts), Gateway oft .65 oder .126.
Hosts → Präfix: 50 Hosts → h = 6 (62 ≥ 50) → /26. **/30**: 2 Hosts (Router-Link), **/31** nach RFC 3021 für Punkt-zu-Punkt.

### 3. IPv6
Subnetze = 2^(Ziel-Präfix − Ausgangs-Präfix). /48 → /64: 2¹⁶ = 65.536. /56 → /64: 2⁸ = 256. Netz-ID: den Block hochzählen (2001:db8:abcd:**00**::/64, **01**, **02** …). Kürzen: führende Nullen weg, längste Null-Folge einmalig `::`.

### 4. Datentransfer
t = Datenmenge (Bit) : Bandbreite (Bit/s). Byte × 8 = Bit; GiB → MiB × 1024. **Overhead**: Datenmenge × 1,1 bei 10 %. Beispiel 20 GB über 1 Gbit/s mit 10 % Overhead: 20 × 8 = 160 Gbit × 1,1 = 176 Gbit : 1 Gbit/s = 176 s (bei GiB: 20 × 1024 MiB usw., Aufgabentext beachten). **VoIP**: Bandbreite = Codec-Bitrate × Gespräche × (1 + Overhead). Beispiel G.711 64 kbit/s × 20 Gespräche × 1,4 = 1.792 kbit/s.

### 5. Strom und USV
Stromkosten = P(W)/1000 × h × Preis/kWh. Cluster: 5 Server à 400 W → 2 kW × 8.760 h = 17.520 kWh × 0,30 € = 5.256 €. **USV**: nutzbare Energie = Nennkapazität (Wh) × nutzbarer Anteil; Laufzeit = Energie : Last. Beispiel 2.000 Wh, Entladung von 100 % auf 30 % = 70 % = 1.400 Wh; Last 700 W → 2 h. Scheinleistung VA vs. Wirkleistung W (W = VA · cos φ). Wirkungsgrad η = Nutzleistung : Aufnahmeleistung.
**USV-Typen**: VFD (Offline: schaltet bei Ausfall auf Batterie), VI (Line-Interactive: zusätzlich Spannungsregelung), VFI (Online: Doppelwandler, ständig vom Wechselrichter, keine Umschaltzeit).

### 6. Verfügbarkeit (SLA)
Downtime = Gesamtzeit × (1 − Verfügbarkeit). 1 Jahr = 8.760 h. 99 % → 87,6 h; 99,9 % → 8,76 h; 99,99 % → 52,6 min. Gesamtverfügbarkeit seriell: V₁ · V₂; parallel (redundant): 1 − (1 − V)ⁿ.

### 7. Wachstumsrechnung SAN/NAS
Kapazität nach Jahren: Bestand + Zuwachs · Jahre; Auslastungsgrenze: Bedarf : Grenze (z. B. 70 %). Beispiel Bestand 5 TiB, +650 GiB/Jahr, 5 Jahre → 5 TiB + 3,17 TiB = 8,17 TiB; bei max. 70 % Auslastung benötigt 8,17 : 0,7 ≈ 11,7 TiB.

## Einfach

Alle Rechenaufgaben lassen sich in **drei Schritten** lösen: 1. Was ist gegeben? 2. Welche Formel kenne ich? 3. Einsetzen und Einheit.

**RAID:** Du hast 4 Festplatten. Bei RAID 5 „opferst“ du eine für die Sicherheit, es bleiben 3 nutzbare. RAID 6 opfert zwei. RAID 10 spiegelt alles, also bleibt die Hälfte. Eine Reserveplatte (Hot-Spare) ist wie ein Ersatzreifen: nutzt man nur im Notfall, zählt aber nicht zur Kapazität.

**Subnetz:** Eine IP-Adresse ist wie eine Hausnummer in einer Straße. Eine Maske sagt, wie groß die Straße ist. /24 heißt 254 Häuser, /26 heißt 62 Häuser, /30 heißt 2 Häuser. Die erste Adresse ist das Straßenschild (Netz-ID), die letzte der Lautsprecher für alle (Broadcast). Dazwischen wohnen die Hosts.

**IPv6:** Hier gibt es riesige Adressen. Wenn du ein großes Grundstück (/56) hast und lauter 64er-Grundstücke daraus machst, dann passen 2⁸ = 256 hinein.

**Download:** Wie lange dauert es, 20 GB zu laden? Wandle erst in Bits um (× 8), teile durch die Geschwindigkeit. Schlechte Netzwerke brauchen oft 10 % mehr (Overhead).

**Strom:** Ein Gerät mit 400 W über das Jahr: 0,4 kW × 24 h × 365 = 3.504 kWh. Mal Preis. 

**USV:** Ein Akku ist wie ein Wassereimer. Du darfst nur bis 30 % leer machen, dann braucht der Generator Zeit. Die nutzbare Menge teilst du durch die Last (Verbrauch pro Stunde) und erhältst die Laufzeit.

**Verfügbarkeit:** 99 % klingt hoch, bedeutet aber 87,6 Stunden Pause pro Jahr (fast 4 Tage).

## Merksatz
- 2ʰ − 2 für Hosts, Blockgröße = 256 − Maske.
- /56 → /64 = 2⁸ = 256.
- Byte × 8 = Bit, Overhead × 1,1.
- Downtime = 8.760 h × (1 − V).
- Hot-Spare vor der RAID-Formel abziehen.

## Prüfungsfalle
- Aus RAID 15 nicht einfach (n−1) rechnen: Erst Spiegelpaare, dann Parität.
- IPv4: Netz-ID und Broadcast nicht als Host zählen.
- GiB vs. GB und Mbit vs. MB: Einheiten angleichen.
- USV: nicht die gesamte Akkukapazität nutzen (z. B. nur 70 %).
- Verfügbarkeit: Basiszeit (365 Tage oder Betriebszeit) klären.
- Rundung beachten (Hosts immer aufrunden auf nächste Zweierpotenz).

## Grafik
### Subnetz 192.168.10.77/26 berechnen
1. Admin: /26 hat Maske 255.255.255.192, Blockgröße 64
2. Admin: 77 liegt im Block 64–127
3. Admin: Netz-ID 192.168.10.64
4. Admin: Broadcast 192.168.10.127
5. Admin: Hosts .65 bis .126, also 62

## Übungen
- A: 6 Platten à 4 TB in RAID 6. Nettokapazität? | L: (6−2) × 4 = 16 TB
- A: 9 Platten à 2 TB, 1 Hot-Spare, RAID 5. Nettokapazität? | L: (8−1) × 2 = 14 TB
- A: Wie viele Hosts hat 10.0.0.0/27? | L: 5 Host-Bits → 32 − 2 = 30 Hosts
- A: SLA 99,95 % pro Jahr. Erlaubte Downtime? | L: 8.760 × 0,0005 = 4,38 h
- A: Server 500 W, USV 1.500 Wh, nutzbar 80 %. Laufzeit? | L: 1.200 Wh : 500 W = 2,4 h
- A: /48 auf /60 teilen. Anzahl Subnetze? | L: 2¹² = 4.096

## Karteikarten
- F: RAID-15-Berechnung? | A: Erst RAID-1-Paare bilden, dann RAID-5-Regel (n−1) auf die Paare
- F: Formel nutzbare Hosts? | A: 2ʰ − 2
- F: Maske /26 dezimal? | A: 255.255.255.192
- F: Hosts im /30? | A: 2
- F: Subnetze von /48 auf /64? | A: 2¹⁶ = 65.536
- F: Übertragungszeit? | A: Bits : Bit/s, Byte × 8, Overhead berücksichtigen
- F: Stromkosten? | A: W/1000 × h × Preis je kWh
- F: USV-Laufzeit? | A: Nutzbare Wh : Last in W
- F: Downtime bei 99,9 % im Jahr? | A: ca. 8,76 h
- F: Blockgröße im Subnetting? | A: 256 − letztes Oktett der Maske
- F: Serielle Verfügbarkeit? | A: Produkt der Einzelverfügbarkeiten

## Quiz
? Wie viele Hosts hat ein /26-Netz?
* 62
- 64
- 60
- 30

? Maske des /27-Netzes?
* 255.255.255.224
- 255.255.255.240
- 255.255.255.192
- 255.255.255.248

? Nettokapazität RAID 6, 5 Platten à 3 TB?
* 9 TB
- 12 TB
- 6 TB
- 15 TB

? Wie viele /64-Subnetze enthält ein /52?
* 4.096
- 256
- 65.536
- 16

? 99,9 % Verfügbarkeit entspricht pro Jahr ca. …
* 8,76 Stunden Ausfall
- 87,6 Stunden Ausfall
- 52 Minuten Ausfall
- 3,65 Tage Ausfall

? 200 W Dauerbetrieb für ein Jahr bei 0,30 €/kWh kosten ca. …
* 525,60 €
- 52,56 €
- 2.628 €
- 175,20 €
! 0,2 × 8.760 = 1.752 kWh × 0,30 = 525,60 €.

? Wie rechnet man eine Dateigröße in Bit um?
* Byte × 8
- Byte : 8
- Byte × 1000
- Byte + 8

? Netz-ID von 192.168.1.130/25?
* 192.168.1.128
- 192.168.1.0
- 192.168.1.129
- 192.168.1.192

? Warum rechnet man bei USV nicht mit 100 % Akku?
* Ein Teil muss als Reserve bleiben (z. B. Start des Generators bei 30 %)
- Akkus laden nicht ganz
- Gesetzliche Vorgabe
- Die Last ist schwankend
