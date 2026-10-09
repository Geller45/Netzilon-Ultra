---
id: ap1-a4-ipv6-subnetting
bereich: AP1
block: A4
kapitel: Netzwerk
titel: IPv6-Subnetting
stufe: Profi
quellen: [06_IPv6_Subnetting.pdf, Übung_IPv6b.pdf]
verweise: [ap1-a4-ipv6, ap1-a4-subnetting, ap1-a3-zahlensysteme]
---

## Profi

### Grundidee
- Ein IPv6-LAN-Subnetz ist praktisch immer **/64**: 64 Bit Netzanteil, 64 Bit Interface-ID. **Unterteilt wird nur im Netzanteil**, nie in der Interface-ID (sonst funktioniert SLAAC nicht).
- Typische Zuweisungen: Provider an Unternehmen **/48**, an Privatkunden **/56** oder /60. Die ersten 48 Bit sind für das **öffentliche Routing** festgelegt; die **16 Bit bis /64** (4. Block, „Subnetz-ID“) stehen für das **interne Subnetting** zur Verfügung → bis zu 2¹⁶ = 65.536 /64-Netze.
- Gerechnet wird **hexadezimal** – statt einer „Blockgröße“ wie bei IPv4 nutzt man die **Hexadezimaldifferenz** (Schrittweite).
- Hostzahlen spielen keine Rolle (2⁶⁴ Adressen pro /64). Es gibt **keine Broadcastadresse**.

### Ablauf (5 Schritte)
1. **Verfügbare Bits**: 64 − gegebenes Präfix.
2. **Benötigte Bits**: nächste Zweierpotenz ≥ Anzahl Subnetze.
3. **Neues Präfix**: altes Präfix + benötigte Bits.
4. **Hexadezimaldifferenz**: 2^(64 − neues Präfix), in Hex umgerechnet. Sie wird im **4. Block** (Bits 49–64) addiert.
5. **Netzadressen**: Beim Startwert beginnen und fortlaufend die Differenz addieren (hexadezimal, mit Übertrag bei 16).

### Hexadezimaldifferenz-Tabelle (4. Block)
| 64 − neues Präfix | 2ⁿ (hex) | Beispielpräfix |
|---|---|---|
| 0 | 1 | /64 |
| 1 | 2 | /63 |
| 2 | 4 | /62 |
| 3 | 8 | /61 |
| 4 | 10 | /60 |
| 5 | 20 | /59 |
| 6 | 40 | /58 |
| 7 | 80 | /57 |
| 8 | 100 | /56 |
| 9 | 200 | /55 |
| 10 | 400 | /54 |
| 11 | 800 | /53 |
| 12 | 1000 | /52 |
| 13 | 2000 | /51 |
| 14 | 4000 | /50 |
| 15 | 8000 | /49 |
Merkhilfe: Jede **4 Bit** mehr Rest = **eine Hex-Stelle** mehr (1 → 10 → 100 → 1000).

### Beispiel aus den Folien: 2001:CC1D:005A:C000::/51, fünf Subnetze
1. Verfügbar: 64 − 51 = **13 Bit**
2. Benötigt: 5 → 2³ = 8 → **3 Bit**
3. Neues Präfix: 51 + 3 = **/54**
4. Differenz: 64 − 54 = 10 → 2¹⁰ = **400 (hex)**
5. Netze (4. Block): C000 → **C400** → **C800** → **CC00** (C + 0 → C, 8 + 4 = C) → **D000** (C + 4 = 16 → 0, Übertrag: C + 1 = D) → D400 → D800 → DC00.

Jedes neue /54-Netz umfasst selbst 2¹⁰ = 1.024 /64-Subnetze.

### Letzte Adresse eines Netzes
Da es keinen Broadcast gibt, wird oft nach der **letzten Adresse** gefragt: nächste Netzadresse − 1 bzw. alle restlichen Bits auf 1. Beispiel 2001:db8:bbcc:40::/58 → letzte Adresse **2001:db8:bbcc:7f:ffff:ffff:ffff:ffff**.

## Übungen
- A: FC00:AD12:4FA2:0000::/48 in 15 Subnetze – verfügbare Bits | L: 64 − 48 = 16
- A: … benötigte Bits, neues Präfix, Differenz | L: 15 → 16 = 2⁴ → 4 Bit; /52; 2¹² = 1000 (hex)
- A: … Netzadressen | L: FC00:AD12:4FA2:0000::/52, :1000::, :2000::, :3000::, :4000::, :5000:: … bis :E000:: (15 Netze; :F000:: bleibt frei)
- A: FC00:AD12:4FA2:A000::/51 in 24 Netze – Bits, Präfix, Differenz | L: 13 verfügbar; 24 → 32 = 2⁵ → 5 Bit; /56; 2⁸ = 100 (hex)
- A: … Netze 1–12 | L: …A000::/56, A100, A200, A300, A400, A500, A600, A700, A800, A900, AA00, AB00 (weiter bis B700 für Netz 24)
- A: fc00:ad12:4fa2:b400::/55 in 3 Netze – Bits, Präfix, Differenz | L: 9 verfügbar; 3 → 4 = 2² → 2 Bit; /57; 2⁷ = 80 (hex)
- A: … Netzadressen | L: fc00:ad12:4fa2:b400::/57, :b480::/57, :b500::/57 (b580 bleibt frei)
- A: 2001:0DB8:BBCC:0000::/53 in 27 Subnetze – Bits, Präfix, Differenz | L: 11 verfügbar; 27 → 32 = 2⁵ → 5 Bit; /58; 2⁶ = 40 (hex)
- A: … erste vier Netze | L: 2001:DB8:BBCC::/58, 2001:DB8:BBCC:40::/58, :80::/58, :C0::/58
- A: … „Broadcastadresse“ des zweiten Netzes | L: IPv6 hat keinen Broadcast (stattdessen Multicast ff02::1). Letzte Adresse von Netz 2: 2001:DB8:BBCC:7F:FFFF:FFFF:FFFF:FFFF
- A: 2001:CC1D:005A:C000::/51, 5 Subnetze | L: 3 Bit, /54, Differenz 400: C000, C400, C800, CC00, D000 (weiter D400, D800, DC00)

## Einfach

IPv6-Subnetting klingt schlimm, ist aber eigentlich **einfacher** als bei IPv4 – weil man sich um die Anzahl der Computer **keine Sorgen** machen muss. Jedes Netz hat sowieso Platz für Milliarden Milliarden Geräte.

Stell dir die IPv6-Adresse als **Adresse mit Postleitzahl** vor:
- Die ersten 48 Bit sind wie **Land + Stadt** – das legt der Provider fest, daran darfst du nichts ändern.
- Der **4. Block** (16 Bit) ist wie **deine Straßennummern** – die darfst du selbst verteilen!
- Die letzten 64 Bit sind die **Hausnummern** – die bleiben immer den Computern.

**So teilst du auf** (Rezept):
1. **Wie viel Platz habe ich?** 64 minus die Zahl hinter dem Schrägstrich.
2. **Wie viel brauche ich?** Anzahl Netze → nächste Zweierpotenz → wie viele Bits (8 Netze = 3 Bit).
3. **Neue Zahl hinter dem Schrägstrich** = alte + gebrauchte Bits.
4. **Schrittweite**: Schau in der Tabelle nach (64 minus neue Zahl → Hex-Wert).
5. **Losspringen**: Vom Start aus immer die Schrittweite dazuzählen – wie beim Hüpfen auf einem Zahlenstrahl, nur in Hex. Wenn eine Stelle über F hinausgeht, gibt's einen Übertrag.

Beispiel: Schrittweite 400. C000 → C400 → C800 → CC00 → D000. Warum D000? Weil C + 4 = 16, und 16 ist in Hex eine „10“ → 0 hinschreiben, 1 weitergeben: C wird D.

**Und Broadcast?** Gibt's bei IPv6 **nicht** – wenn eine Aufgabe danach fragt, ist das eine **Fangfrage**.

## Merksatz
- Unterteilt wird **nur bis /64**.
- Differenz = **2^(64 − neues Präfix)** in Hex.
- **4 Bit = 1 Hex-Stelle**: 10, 100, 1000.
- Übertrag bei **16**, nicht bei 10.
- IPv6: **kein Broadcast!**

## Prüfungsfalle
- Mit 128 statt 64 gerechnet.
- Differenz dezimal statt hexadezimal addiert (C400 + 400 = C800, aber CC00 + 400 = D000).
- Nach Broadcast gefragt → Fangfrage.
- Präfix über /64 hinaus erweitert.
- Führende Nullen im 4. Block beim Hochzählen verwechselt (:40:: ist 0040).

## Grafik
### Hex-Zahlenstrahl
4. Block als Zahlenstrahl von 0000 bis FFFF; ein Frosch springt mit der Schrittweite; bei jedem Sprung erscheint die Netzadresse; Überträge (z. B. CC00 → D000) werden mit einem Funken hervorgehoben.

### Präfix-Lineal
128-Bit-Balken, geteilt in 48 (Provider, grau, gesperrt) · 16 (Subnetz-ID, bunt) · 64 (Interface-ID, grau); Regler für das neue Präfix färbt die geliehenen Bits.

### IPv6-Subnetzrechner
Eingabe Präfix und Anzahl Netze → alle fünf Schritte mit Ergebnis und Liste der Netze.

## Karteikarten
- F: Bis zu welchem Präfix wird IPv6 für LANs unterteilt? | A: Bis /64.
- F: Wie viele Bits stehen bei einem /48 für Subnetting zur Verfügung? | A: 16 Bit (65.536 /64-Netze).
- F: Formel Hexadezimaldifferenz? | A: 2^(64 − neues Präfix), in Hex.
- F: Differenz bei /56? | A: 100 (hex).
- F: Differenz bei /52? | A: 1000 (hex).
- F: Differenz bei /58? | A: 40 (hex).
- F: /51 in 5 Netze – neues Präfix? | A: /54 (3 Bit).
- F: Was folgt auf CC00 bei Differenz 400? | A: D000.
- F: Gibt es bei IPv6 eine Broadcastadresse? | A: Nein – Multicast (z. B. ff02::1).

## Quiz
? 2001:db8:1::/48 soll in 10 Subnetze geteilt werden. Wie lautet das neue Präfix?
* /52
- /51
- /58
- /64

? Wie groß ist die Hexadezimaldifferenz bei einem neuen Präfix /60?
* 10
- 16
- 4
- 100

? Welche Netzadresse folgt auf 2001:db8:0:a800::/53?
* 2001:db8:0:b000::/53
- 2001:db8:0:a900::/53
- 2001:db8:0:ac00::/53
- 2001:db8:0:1000::/53

? Wie viele /64-Netze enthält ein /56?
* 256
- 56
- 8
- 65.536

? Wie lautet die Broadcastadresse von fd00:1::/64?
* IPv6 verwendet keine Broadcastadressen
- fd00:1::ffff
- fd00:1:ffff:ffff::
- ff02::1 ist die Broadcastadresse dieses Netzes
