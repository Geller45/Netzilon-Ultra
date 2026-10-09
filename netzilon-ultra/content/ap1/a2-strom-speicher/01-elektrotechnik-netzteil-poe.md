---
id: ap1-a2-netzteil
bereich: AP1
block: A2
kapitel: Strom & Speicher
titel: Elektrotechnik-Grundlagen, Netzteil & PoE
stufe: Einsteiger
quellen: [Netzteil_oL.pdf, AP1-2026-F_2-4.pdf, USV_phys_Kenngrößen_Winter_2018.pdf]
verweise: [ap1-a2-usv, ap1-a1-pci, ap1-a1-rechneraufbau]
---

## Profi

### Elektrische Grundgrößen
| Formelzeichen | Bezeichnung | Maßeinheit | Einheitenzeichen |
|---|---|---|---|
| **U** | elektrische Spannung | Volt | V |
| **I** | elektrische Stromstärke | Ampere | A |
| **R** | elektrischer Widerstand | Ohm | Ω |
| **P** | elektrische Leistung | Watt | W |
| **W** (oder E) | elektrische Energie/Arbeit | Wattstunde | Wh (kWh) |
| **Q** | elektrische Ladungsmenge | Amperestunde | Ah |
| **t** | Zeit | Stunde / Sekunde | h / s |

### Formeln (AP1-relevant)
| Formel | Name | Umstellungen |
|---|---|---|
| **U = R × I** | Ohmsches Gesetz | R = U / I, I = U / R |
| **P = U × I** | Leistung | U = P / I, I = P / U |
| **W = P × t** | Energie | P = W / t, t = W / P |
| **W = Q × U** | Energie aus Ladung | Q = W / U |
| **Q = I × t** | Ladungsmenge | t = Q / I |
| P = I² × R, P = U² / R | abgeleitet | |

Umrechnung: 1 kW = 1000 W; 1 kWh = 1000 Wh; 1 h = 60 min.

### Das Typenschild eines Netzteils lesen
Beispiel (AP1-Aufgabe):
| Input | Output |
|---|---|
| 100–240 V, 10 A, 50–60 Hz | +12 V dc 50 A max. · −12 V dc 0,5 A max. · +5 V dc SB 3 A max. · **Power = 600 W max.** |

- **Input**: Weitbereichsnetzteil (100–240 V Wechselspannung, 50/60 Hz) – funktioniert weltweit. Die 10 A sind der maximale Eingangsstrom (Einschaltstrom/Absicherung), nicht der Dauerverbrauch.
- **Output**: Gleichspannungen (dc = direct current). **+12 V** versorgt CPU, GPU, Laufwerksmotoren (größter Anteil, 12 V × 50 A = 600 W theoretisch). **−12 V** Legacy (serielle Schnittstellen). **+5 V SB** = Standby für Soft-Off/Wake-on-LAN (siehe ATX). Die Gesamtleistung ist auf **600 W** begrenzt – die Summe aller Schienen darf diesen Wert nicht überschreiten.

### Netzteil dimensionieren (Prüfungsaufgabe)
Komponenten eines File-Servers:
| Anzahl | Komponente | je | gesamt |
|---|---|---|---|
| 4 | Festplatte | 15 W | 60 W |
| 2 | CPU | 95 W | 190 W |
| 1 | Mainboard mit Onboard-Komponenten | 40 W | 40 W |
| 1 | Übrige Komponenten | 100 W | 100 W |
| | **Summe** | | **390 W** |

Mit **25 % Reserve**: 390 W × 1,25 = **487,5 W**. 487,5 W ≤ 600 W → **Das Netzteil ist ausreichend.**

Typische Faustregel: Netzteil so wählen, dass es im Normalbetrieb bei ca. **50–70 % Last** läuft – dort ist der Wirkungsgrad am höchsten.

### Wirkungsgrad und 80 PLUS
**Wirkungsgrad η = abgegebene Leistung / aufgenommene Leistung × 100 %.** Ein Netzteil mit 90 % Wirkungsgrad, das 450 W an die Komponenten liefert, nimmt 500 W aus der Steckdose auf; 50 W werden zu Wärme.

| 80 PLUS-Stufe | Wirkungsgrad bei 50 % Last (230 V intern) |
|---|---|
| Standard/White | ≥ 85 % |
| Bronze | ≥ 88 % |
| Silver | ≥ 90 % |
| Gold | ≥ 92 % |
| Platinum | ≥ 94 % |
| Titanium | ≥ 96 % |
Werte für 230-V-Netze (EU). Alternative Zertifizierung: **Cybenetics** (ETA/LAMBDA für Lautstärke).

**Weitere Netzteilbegriffe**: **Active PFC** (Leistungsfaktorkorrektur, in der EU Pflicht bei > 75 W), **modulares Kabelmanagement**, **ATX 3.x** (12V-2x6-Anschluss für Grafikkarten, Lastspitzen), Schutzschaltungen (OVP, OCP, SCP, OTP), **redundante Netzteile** bei Servern (1+1, hot-swap).

### Power over Ethernet (PoE)
PoE überträgt **Daten und Strom über dasselbe Netzwerkkabel** (Twisted Pair, ab Cat 5e). Ein **PSE** (Power Sourcing Equipment – PoE-Switch oder Injektor) versorgt ein **PD** (Powered Device – IP-Kamera, Access Point, VoIP-Telefon). Das PSE prüft vorher per Signatur, ob ein PoE-fähiges Gerät angeschlossen ist – normale Geräte bekommen keinen Strom.

| Standard | Name | Leistung am PSE | Leistung am PD | Adernpaare |
|---|---|---|---|---|
| IEEE 802.3af | PoE (Type 1) | 15,4 W | 12,95 W | 2 |
| IEEE 802.3at | **PoE+** (Type 2) | 30 W | 25,5 W | 2 |
| IEEE 802.3bt | PoE++ Type 3 | 60 W | 51 W | 4 |
| IEEE 802.3bt | PoE++ Type 4 | 90 W | 71,3 W | 4 |
Der Unterschied PSE/PD sind **Leitungsverluste** (max. 100 m Kabel).

**Praxisbeispiel AP1 2026 – IP-Kamera**:
- Typisch 5 W · max. ohne Heizung mit IR 13 W · max. mit Heizung und IR **24 W**.
- Normalbetrieb laut Hersteller an **PoE+ (802.3at)** → deckt bis 25,5 W, also auch Heizung + IR.
- An einfachem PoE (802.3af, 12,95 W) nur **ohne Heizung und IR** nutzbar.
- **IR** (Infrarot-LEDs, 850 nm) ermöglicht **Nachtsicht**; **Heizung** verhindert Beschlagen/Vereisen der Scheibe bei Außenmontage im Winter. Beides wird als Variante angegeben, weil es den Strombedarf stark erhöht und das **PoE-Budget des Switches** bestimmt.
- **PoE-Budget**: Gesamtleistung, die ein Switch über alle Ports liefern kann (z. B. 370 W). 16 Kameras × 24 W = 384 W → Budget reicht nicht!

**„No default passwords“** (Security by Default, EU Cyber Resilience Act): Das Gerät hat **kein voreingestelltes Standardpasswort**. Konsequenzen:
1. Bei der Ersteinrichtung **muss** ein individuelles, sicheres Passwort gesetzt werden – Angriffe mit bekannten Standard-Zugangsdaten (Botnetze wie Mirai) laufen ins Leere.
2. Mehraufwand bei der Inbetriebnahme: Jede Kamera muss einzeln (hier per USB-C oder Web-Erstzugang) konfiguriert werden, bevor sie produktiv nutzbar ist; Passwörter müssen dokumentiert/in einem Passwortmanager verwaltet werden. Bei Verlust ist nur ein Werksreset möglich.

## Einfach

Strom kann man sich wie **Wasser in einem Schlauch** vorstellen:
- **Spannung (Volt)** ist der **Wasserdruck** – wie stark das Wasser drückt.
- **Stromstärke (Ampere)** ist die **Wassermenge**, die pro Sekunde durchfließt.
- **Widerstand (Ohm)** ist ein **enger Schlauch** – er bremst das Wasser.
- **Leistung (Watt)** ist, wie viel **Arbeit** das Wasser pro Sekunde machen kann (ein Wasserrad drehen). Druck × Menge = Leistung → **P = U × I**.
- **Energie (Wattstunden)** ist, wie viel Arbeit insgesamt verrichtet wurde: Leistung × Zeit.
- **Ladung (Amperestunden)** ist, wie viel Wasser in einem **Tank** (Akku) steckt.

**Das Netzteil** ist wie ein **Wasserwerk**: Es nimmt den wilden Strom aus der Steckdose (Wechselstrom, 230 V) und macht daraus ruhigen, sauberen Strom mit genau den Drücken, die die Teile im PC brauchen (12 V, 5 V, 3,3 V).

**Wie groß muss das Netzteil sein?** Du zählst zusammen, was alle Teile verbrauchen – wie beim Einkaufen die Preise addieren. Dann legst du **ein Viertel oben drauf** als Reserve (falls später noch etwas dazukommt). Ist das Netzteil stärker als diese Summe: alles gut!

**Wirkungsgrad**: Kein Wasserwerk ist perfekt – etwas geht immer als Wärme verloren. Ein „80 PLUS Gold“-Netzteil verschwendet weniger als ein billiges – wie ein sparsames Auto.

**PoE** ist ein Zaubertrick: Durch **ein einziges Netzwerkkabel** kommen **Internet und Strom** gleichzeitig. Eine Kamera an der Hauswand braucht dann keine Steckdose – super praktisch! Der Switch prüft vorher höflich: „Kannst du mit Strom umgehen?“ – erst dann schickt er Strom.

Die Kamera aus der Prüfung hat eine **Heizung** (damit die Linse im Winter nicht zufriert) und **Infrarot-Lampen** (damit sie nachts sehen kann – für uns unsichtbares Licht). Beides kostet extra Strom. Deshalb braucht sie das stärkere **PoE+**.

**„Kein Standardpasswort“**: Früher kamen Kameras mit Passwort „admin“ – das kannten auch alle Hacker! Jetzt **zwingt** dich das Gerät, beim ersten Einschalten ein eigenes Passwort auszudenken. Sicherer, aber mehr Arbeit beim Einrichten.

## Merksatz
- **URI**: U = R × I – „**U**RI“ wie der Kanton in der Schweiz.
- **PUI**: P = U × I – „**P**apa **U**nd **I**ch“.
- **W = P × t** – Energie = Leistung mal Zeit.
- **Reserve 25 %** → mal **1,25** rechnen.
- PoE: **af 15 – at 30 – bt 60/90** Watt (am Switch).

## Prüfungsfalle
- Watt (Leistung) und Wattstunden (Energie) verwechseln.
- 25 % Reserve: mal 1,25 – nicht plus 25 W.
- PoE-Leistung am Switch (PSE) ≠ am Gerät (PD).
- Das PoE-Budget des Switches gilt für **alle Ports zusammen**.
- Die Eingangsstromangabe (10 A) nicht in die Leistungsberechnung einbeziehen.

## Grafik
### Wasser-Analogie
Wasserturm (Spannung), Rohr mit Durchfluss (Strom), Engstelle (Widerstand), Wasserrad (Leistung); Regler für U und R, Durchfluss und Leistung ändern sich live nach Ohmschem Gesetz.

### Formeldreieck
Interaktive Dreiecke U/R·I und P/U·I; Klick auf eine Größe verdeckt sie und zeigt die Umstellung.

### Netzteil-Rechner
Komponenten per Drag & Drop in einen Server ziehen, Summe wächst, Reserve-Balken (+25 %) wird angehängt, Ampel zeigt, ob das Netzteil reicht.

### PoE-Budget
Switch mit 16 Ports, Kameras werden eingesteckt; Budgetbalken füllt sich, beim Überschreiten färbt er sich rot und der letzte Port bleibt dunkel.

## Karteikarten
- F: Formelzeichen und Einheit der Spannung? | A: U, Volt (V).
- F: Formelzeichen und Einheit des Widerstands? | A: R, Ohm (Ω).
- F: Ohmsches Gesetz? | A: U = R × I.
- F: Formel elektrische Leistung? | A: P = U × I.
- F: Formel elektrische Energie? | A: W = P × t (bzw. W = Q × U).
- F: Server braucht 390 W, 25 % Reserve. Mindestleistung Netzteil? | A: 390 × 1,25 = 487,5 W.
- F: Was bedeutet „5 V SB“ auf dem Typenschild? | A: 5-V-Standby-Schiene für Soft-Off und Wake-on-LAN.
- F: Wie berechnet man den Wirkungsgrad? | A: η = abgegebene Leistung / aufgenommene Leistung × 100 %.
- F: Wirkungsgrad 80 PLUS Gold (230 V, 50 % Last)? | A: ≥ 92 %.
- F: PoE-Standards und Leistung am PSE? | A: 802.3af 15,4 W; 802.3at (PoE+) 30 W; 802.3bt 60 W (Type 3) / 90 W (Type 4).
- F: Was ist ein PSE, was ein PD? | A: PSE: stromliefernde Quelle (PoE-Switch/Injektor). PD: versorgtes Gerät (Kamera, AP, Telefon).
- F: Wozu dient die Heizung einer Außenkamera? | A: Verhindert Beschlagen/Vereisen bei Kälte.
- F: Zwei Konsequenzen von „no default passwords“? | A: Sicheres eigenes Passwort bei Ersteinrichtung Pflicht (Schutz vor Standard-Login-Angriffen); Mehraufwand bei Inbetriebnahme und Passwortverwaltung.

## Quiz
? Ein Gerät nimmt bei 230 V einen Strom von 0,5 A auf. Welche Leistung hat es?
* 115 W
- 460 W
- 230,5 W
- 0,0022 W

? Ein Netzteil liefert 450 W an die Komponenten und nimmt 500 W auf. Wie hoch ist der Wirkungsgrad?
* 90 %
- 111 %
- 50 %
- 45 %

? Eine PoE-Kamera benötigt maximal 24 W. Welcher Standard ist mindestens erforderlich?
* IEEE 802.3at (PoE+)
- IEEE 802.3af
- IEEE 802.3u
- Kein PoE möglich

? Welche Einheit hat die elektrische Energie?
* Wattstunde (Wh)
- Watt (W)
- Amperestunde (Ah)
- Volt (V)

? Ein Switch hat ein PoE-Budget von 370 W. Wie viele Kameras mit je 24 W kann er maximal versorgen?
* 15
- 16
- 24
- 12

? Wie lautet das ohmsche Gesetz?
* U = R × I
- P = U × I
- W = P × t
- I = U × R
! Spannung = Widerstand × Stromstärke.

? Welche Spannung liefert ein ATX-Netzteil NICHT als Standardschiene?
* 48 V
- 12 V
- 5 V
- 3,3 V
! 48 V wird z. B. für PoE verwendet, nicht im ATX-Netzteil.

? Was beschreibt der 80-PLUS-Standard?
* Mindestwirkungsgrade von Netzteilen bei verschiedenen Lasten
- Die maximale Leistung eines Netzteils
- Die Lautstärke des Lüfters
- Die Anzahl der Anschlüsse
! Stufen von Bronze über Gold bis Titanium.
