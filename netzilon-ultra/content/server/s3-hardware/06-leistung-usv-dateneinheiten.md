---
id: server-hw-rechenaufgaben
bereich: AP1
pruefungen: [AP1, AP2, Schule]
fach: ITK / Grundlagen
block: S3
kapitel: Hardware
titel: Leistung, Energie, USV-Überbrückungszeit und Dateneinheiten – Formeln und IHK-Aufgaben Winter 2010/2018 gelöst
stufe: Fortgeschritten
quellen: [Leistung-Formeln.pdf, USV_phys_Kenngrößen_Winter_2018.pdf, USV_Aufgabe_Winter_2010.pdf, Dateneinheiten.pdf]
verweise: [ap1-a2-usv, ap1-a2-netzteil, ap1-a3-binaerpraefixe, ap2-hochverfuegbarkeit, server-hw-rechneraufbau-uebung]
---

## Profi

### Physikalische Größen (Formelblatt der IHK)
| Größe | Formelzeichen | Einheit |
|---|---|---|
| elektrische **Leistung** | **P** | Watt (**W**) |
| elektrische **Stromstärke** | **I** | Ampere (**A**) |
| elektrische **Spannung** | **U** | Volt (**V**) |
| **Ladungsmenge** (Kapazität eines Akkus) | **Q** | Amperestunde (**Ah**) |
| elektrische **Energie** (Arbeit) | **W** | Wattstunde (**Wh**), kWh |
| Zeit | **t** | Stunde (h) |

**Formeln**
- **W = Q · U** (Energie = Ladungsmenge × Spannung) → Wh = Ah × V
- **P = W / t** (Leistung = Energie / Zeit) → umgestellt **t = W / P** und **W = P · t**
- **P = U · I** (Leistung = Spannung × Strom)
- Wechselstrom: **Scheinleistung S = U · I** in **VA**, **Wirkleistung P = S · cos φ** in **W** (cos φ = Leistungsfaktor, bei modernen Netzteilen mit PFC ≈ 0,9–0,99). USVs werden oft in **VA** angegeben – für die Dimensionierung immer **beide** Grenzen (W und VA) prüfen.
- Stromkosten: **Kosten = P[kW] · t[h] · Preis[€/kWh]**

### Vorgehen bei Überbrückungszeit-Aufgaben
1. **Angeschlossene Leistung** P addieren (alle Verbraucher, ggf. Last in %).
2. **Gesamtkapazität** Q der Akkus: bei **Parallelschaltung** Ah addieren (Spannung bleibt), bei **Reihenschaltung** Spannungen addieren (Ah bleibt) – die **Energie in Wh** ist in beiden Fällen gleich.
3. **Energie** W = Q · U.
4. **Zeit** t = W / P, Nachkommateil × 60 = Minuten, **laut Aufgabe runden** (meist abrunden).
5. In der Praxis Wirkungsgrad (Wechselrichter ca. 85–95 %), Entladetiefe und Alterung abziehen – in IHK-Aufgaben steht meist „Verluste nicht berücksichtigen“.

### USV-Klassen nach IEC 62040-3 (EN 62040-3)
| Klasse | Typ | Aufbau | Umschaltzeit | schützt vor |
|---|---|---|---|---|
| **VFD** (*Voltage and Frequency Dependent*) | **Offline/Standby** | Eingang → **Umschalter** → Ausgang; Ladeteil und Wechselrichter **nur im Notfall** aktiv | ca. 2–10 ms | Stromausfall, Unterspannung grob |
| **VI** (*Voltage Independent*) | **Line-Interactive** | wie VFD, zusätzlich **AVR** (automatische Spannungsregelung) und **Steuerlogik** | ca. 2–4 ms | + Spannungsschwankungen |
| **VFI** (*Voltage and Frequency Independent*) | **Online/Doppelwandler** | **Gleichrichter → DC-Zwischenkreis/Batterie (DC/DC-Wandler) → Wechselrichter**, dazu **statischer Bypass** und **Service-Bypass** | **0 ms** | + Frequenzschwankungen, Spitzen, Oberschwingungen |

### Dateneinheiten
- **Bit** (*binary digit*, Claude Shannon 1948): kleinste Informationseinheit, 0 oder 1; Übertragungsraten in **bit/s**.
- **Byte** = **8 Bit** = 256 Werte (0–255). Früher waren 6-, 7- oder 9-Bit-Bytes üblich; mit **IBM System/360** (1964) setzte sich das 8-Bit-Byte durch. „Byte“ kommt vermutlich von „bite“ (Bissen), absichtlich anders geschrieben, um Verwechslungen mit „bit“ zu vermeiden. **ASCII** (1963/1968) nutzt 7 Bit pro Zeichen.
- **SI (dezimal, Hersteller)**: kB = 10³, MB = 10⁶, GB = 10⁹, TB = 10¹², PB = 10¹⁵, EB = 10¹⁸, ZB = 10²¹, YB = 10²⁴ Byte.
- **IEC (binär, Betriebssystem)**: KiB = 2¹⁰ = 1 024, MiB = 2²⁰ = 1 048 576, GiB = 2³⁰ = 1 073 741 824, TiB = 2⁴⁰, PiB = 2⁵⁰, EiB = 2⁶⁰, ZiB = 2⁷⁰, YiB = 2⁸⁰.
- Darum zeigt **Windows** eine „500-GB“-SSD als ca. **465 GB** an (in Wahrheit GiB): 500 · 10⁹ / 2³⁰ = **465,66 GiB**.
- **1 MB/s = 8 Mbit/s** – Downloads dauern deshalb länger als gedacht.

## Einfach

Stell dir den Akku der USV als **Wassertank** vor:
- Die **Ladungsmenge Q (Ah)** ist, **wie viel Wasser** im Tank ist.
- Die **Spannung U (V)** ist, **wie hoch** der Tank steht – höher heißt mehr Druck.
- **Energie W = Q · U** ist die **gesamte Arbeit**, die das Wasser leisten kann.
- Die **Leistung P (W)** ist, **wie schnell** die Server das Wasser abzapfen.
- Wie lange reicht das Wasser? **Zeit = Energie ÷ Leistung**. Zwei Server zapfen doppelt so schnell – der Tank ist halb so schnell leer.

Die drei USV-Typen sind wie **Ersatzspieler**:
- **Offline (VFD)**: sitzt auf der **Bank** und springt erst ein, wenn der Strom weg ist – ein kurzer Moment ohne Spieler.
- **Line-Interactive (VI)**: sitzt auf der Bank, **ruft aber schon Tipps** rein (gleicht Spannungsschwankungen aus).
- **Online (VFI)**: ist **immer auf dem Platz** – der Strom läuft ständig durch Akku und Wechselrichter. Fällt das Netz aus, merkt niemand etwas.

**Bit und Byte**: Ein Bit ist **ein Lichtschalter** (an/aus). Ein Byte sind **acht Schalter nebeneinander** – damit kann man 256 verschiedene Muster bilden, genug für alle Buchstaben. Die Festplattenfirma zählt in **Tausendern**, Windows in **1024ern** – deshalb „fehlt“ scheinbar Platz.

## Merksatz
- **W = Q · U, t = W / P.**
- **Wh durch W gibt h.** Nachkomma × 60 = Minuten.
- **VFD = Bank, VI = Bank mit AVR, VFI = immer auf dem Platz (0 ms).**
- **Byte = 8 Bit; 1 MB/s = 8 Mbit/s.**
- **k = 1 000, Ki = 1 024.**

## Prüfungsfalle
- **Ah ≠ Wh**: erst mit der Spannung multiplizieren.
- Vier Akkus à 100 Ah/12 V: parallel 400 Ah bei 12 V, in Reihe 100 Ah bei 48 V – **beides 4 800 Wh**. Wer 400 Ah × 48 V rechnet, verdoppelt fälschlich vierfach.
- **Abrunden**, wenn die Aufgabe es verlangt (3,4286 h → 3 h **25** min, nicht 26).
- Bei W und **VA**: Die IHK schreibt „W (VA)“ – bei cos φ = 1 sind die Zahlen gleich, sonst VA = W / cos φ.
- VFI-Nachteil ist der **Wirkungsgrad/Wärme/Preis**, nicht die Umschaltzeit (die ist 0 ms).
- Dateneinheiten: Netz in **Bit**, Speicher in **Byte**.

## Grafik
### USV-Überbrückung Winter 2018
1. Netz: fällt aus
2. Akku: 4 × 100 Ah = 400 Ah bei 12 V
3. Akku: Energie W = 400 Ah × 12 V = 4 800 Wh
4. USV -> Server1: 700 W
5. USV -> Server2: 700 W
6. USV: t = 4 800 Wh ÷ 1 400 W = 3,43 h ≈ 3 h 25 min
### Online-USV (VFI) im Normalbetrieb
1. Eingang -> Gleichrichter: Wechselstrom wird Gleichstrom
2. Gleichrichter -> Batterie: lädt über DC/DC-Wandler
3. Gleichrichter -> Wechselrichter: erzeugt sauberen Sinus
4. Wechselrichter -> Ausgang: Server bekommen geregelte Spannung
5. Eingang: Netzausfall → Batterie speist den Wechselrichter ohne Unterbrechung

## Lab
Maschine: **EXA-CL01** – Rechenwege in PowerShell nachprüfen.

### PowerShell
```powershell
# Winter 2018: USV-Ueberbrueckungszeit
$P = 2 * 700                 # W
$Q = 4 * 100                 # Ah (parallel, 12 V)
$W = $Q * 12                 # Wh
$t = $W / $P                 # h
$h = [math]::Floor($t); $min = [math]::Floor(($t - $h) * 60)
"P=$P W, Q=$Q Ah, W=$W Wh, t=$([math]::Round($t,4)) h = $h h $min min"

# Dateneinheiten: 500 GB (Hersteller) in GiB (Windows)
500e9 / 1GB                  # PowerShell-Suffix GB = 2^30 -> 465,66
# Download 4 GB mit 100 Mbit/s
(4e9 * 8) / 100e6            # Sekunden -> 320 s
```

## Übungen
- A: 2018 a) An die USV angeschlossene Leistung P? | L: P = 2 × 700 W = 1 400 W (VA)
- A: 2018 b) Gesamte Kapazität der vier Akkus Q? | L: Q = 4 × 100 Ah = 400 Ah (bei 12 V, parallel)
- A: 2018 c) Energie, die die Akkus bei 12 V abgeben können (W)? | L: W = Q · U = 400 Ah × 12 V = 4 800 Wh
- A: 2018 d) Theoretische Überbrückungszeit in h und min, abgerundet? | L: t = W / P = 4 800 Wh / 1 400 W = 3,4286 h; 0,4286 × 60 = 25,7 min → 3 Std. 25 Min.
- A: 2010 ca) Abbildung 1 (AVR, Umschalter, Steuerlogik, Ladeteil, Wechselrichter, Batterie) – Klasse? | L: VI – Line-Interactive (AVR regelt die Spannung, Umschalter schaltet im Notfall auf den Wechselrichter)
- A: 2010 ca) Abbildung 2 (Umschalter, Ladeteil, Wechselrichter, Batterie) – Klasse? | L: VFD – Offline/Standby (Verbraucher hängen direkt am Netz, Umschaltung erst bei Ausfall)
- A: 2010 ca) Abbildung 3 (Gleichrichter, DC/DC-Wandler, Wechselrichter, statischer Bypass, Service-Bypass) – Klasse? | L: VFI – Online/Doppelwandler (Verbraucher werden ständig über den Wechselrichter versorgt)
- A: 2010 cb) Je zwei Vor- und Nachteile einer VFI-USV | L: Vorteile: keine Umschaltzeit (0 ms); vollständige Entkopplung vom Netz – Schutz vor Spannungs- und Frequenzschwankungen, Spitzen, Oberschwingungen; konstante saubere Sinusspannung. Nachteile: höhere Anschaffungskosten; geringerer Wirkungsgrad durch Doppelwandlung (Verluste, Wärme, höhere Betriebskosten); Lüftergeräusch, mehr Wartung (Akkus/Lüfter).
- A: Zusatz: Eine USV hat 2 Akkus à 9 Ah/12 V in Reihe, Last 180 W. Überbrückungszeit? | L: Reihe: 24 V, 9 Ah → W = 9 × 24 = 216 Wh; t = 216 / 180 = 1,2 h = 1 h 12 min
- A: Zusatz: Server 450 W, cos φ = 0,9 – welche Scheinleistung muss die USV mindestens liefern? | L: S = P / cos φ = 450 / 0,9 = 500 VA
- A: Zusatz: Ein Switch mit 60 W läuft 24/7 ein Jahr bei 0,32 €/kWh. Kosten? | L: 0,06 kW × 8 760 h = 525,6 kWh × 0,32 € = 168,19 €
- A: Wie viel GiB zeigt Windows für eine 2-TB-Festplatte an? | L: 2 · 10¹² / 2³⁰ = 1 862,65 GiB ≈ 1,82 TiB
- A: Wie lange dauert der Download von 4 GB über 100 Mbit/s (ohne Overhead)? | L: 4 · 10⁹ Byte × 8 = 32 · 10⁹ bit ÷ 100 · 10⁶ bit/s = 320 s = 5 min 20 s
- A: Wie viele Werte kann ein Byte darstellen? | L: 2⁸ = 256 (0–255)

## Karteikarten
- F: Formel elektrische Energie aus Ladung und Spannung? | A: W = Q · U (Wh = Ah · V)
- F: Formel Leistung aus Energie und Zeit? | A: P = W / t
- F: Formel Überbrückungszeit? | A: t = W / P
- F: Einheit der Ladungsmenge in USV-Aufgaben? | A: Amperestunde (Ah)
- F: Was bedeutet VFI? | A: Voltage and Frequency Independent – Online-USV (Doppelwandler)
- F: Was bedeutet VFD? | A: Voltage and Frequency Dependent – Offline-/Standby-USV
- F: Was bedeutet VI? | A: Voltage Independent – Line-Interactive-USV mit AVR
- F: Welche Norm klassifiziert USVs? | A: IEC/EN 62040-3
- F: Unterschied W und VA? | A: W = Wirkleistung, VA = Scheinleistung; P = S · cos φ
- F: Wie viele Byte sind 1 KiB? | A: 1 024
- F: Wie viele Mbit/s entsprechen 1 MB/s? | A: 8 Mbit/s
- F: Warum zeigt Windows 500 GB als ca. 465 GB? | A: Hersteller rechnet dezimal (10⁹), Windows binär (2³⁰) und schreibt GB statt GiB
- F: Wer begründete die Informationstheorie mit dem Bit? | A: Claude Shannon (1948)

## Quiz
? Vier Akkus à 100 Ah (12 V, parallel) speisen 1 400 W. Wie lange reicht die Energie?
* ca. 3 h 25 min
- ca. 34 min
- ca. 13 h 42 min
- ca. 2 h 51 min

? Welche Formel berechnet die elektrische Energie aus Ladung und Spannung?
* W = Q · U
- W = P · I
- W = U / Q
- W = Q / U

? Welche USV-Klasse arbeitet mit Gleichrichter und Wechselrichter dauerhaft im Energiefluss?
* VFI
- VFD
- VI
- SLA

? Welche USV besitzt eine automatische Spannungsregelung (AVR) und Umschalter?
* VI (Line-Interactive)
- VFD (Offline)
- VFI (Online)
- Keine

? Welcher Nachteil gilt für eine VFI-USV?
* Geringerer Wirkungsgrad durch Doppelwandlung
- Lange Umschaltzeit
- Kein Schutz vor Frequenzschwankungen
- Keine Batterie

? Wie viele GiB hat eine Festplatte mit 500 GB laut Hersteller?
* ca. 465,66 GiB
- 500 GiB
- 512 GiB
- ca. 476,84 GiB

? Ein Download hat 25 MB/s. Wie viel ist das in Mbit/s?
* 200 Mbit/s
- 25 Mbit/s
- 3,125 Mbit/s
- 250 Mbit/s

? Server mit 450 W Wirkleistung und cos φ = 0,9. Benötigte Scheinleistung?
* 500 VA
- 405 VA
- 450 VA
- 900 VA

? Wie viele Werte stellt ein Byte dar?
* 256
- 255
- 128
- 512

## Lücken
- Die Energie berechnet man mit W = {Q} · {U}, die Zeit mit t = {W} / {P}.
- Die Online-USV heißt nach IEC 62040-3 {VFI}, die Offline-USV {VFD}.
- Ein Byte hat {8} Bit, ein KiB hat {1024} Byte.

## Zuordnen
### USV-Aufbau und Klasse
- Umschalter, Ladeteil, Wechselrichter => VFD
- AVR, Umschalter, Steuerlogik => VI
- Gleichrichter, DC/DC-Wandler, Wechselrichter, Bypass => VFI

## Reihenfolge
### Überbrückungszeit berechnen
1. Angeschlossene Leistung P addieren
2. Gesamtkapazität Q der Akkus bestimmen
3. Energie W = Q · U berechnen
4. Zeit t = W / P berechnen
5. Nachkommastellen in Minuten umrechnen und laut Aufgabe runden

## Freitext
- F: Nennen Sie je zwei Vor- und Nachteile einer VFI-USV (4 Punkte). | M: Vorteile: 0 ms Umschaltzeit; vollständiger Schutz vor Spannungs-/Frequenzschwankungen und Störungen. Nachteile: höhere Anschaffungskosten; schlechterer Wirkungsgrad (Verluste, Wärme, Stromkosten) | P: 4
- F: Erläutern Sie, warum eine 1-TB-Festplatte im Betriebssystem kleiner erscheint. | M: Hersteller nutzen SI-Präfixe (1 TB = 10¹² Byte), Windows rechnet binär (2⁴⁰) und zeigt ca. 931 „GB“ (eigentlich GiB) an | P: 3

## Szenario
### USV für den Serverschrank
Die IT-Kommunal GmbH sichert einen Serverschrank (Terminalserver, VPN-Router, Firewall, Switch) mit gesamt 900 W Wirkleistung ab. Leistungsfaktor 0,9; die Server sollen mindestens 15 Minuten überbrückt werden.
- F: Welche Scheinleistung muss die USV mindestens haben? | A: 900 W / 0,9 = 1 000 VA (plus Reserve, z. B. 1 500 VA)
- F: Welche Energie braucht man für 15 Minuten (ohne Verluste)? | A: W = P · t = 900 W × 0,25 h = 225 Wh
- F: Welche USV-Klasse empfehlen Sie? | A: VFI (Online) – keine Umschaltzeit, volle Netzentkopplung für kritische Systeme
- F: Was ist beim Akku zu beachten? | A: Wirkungsgrad und Alterung einplanen (z. B. 20–30 % Reserve), regelmäßiger Akkutest

## Spickzettel
- W = Q · U, P = W / t → t = W / P, P = U · I, P = S · cos φ
- Parallel: Ah addieren; Reihe: V addieren – Wh gleich
- 2018: 1 400 W, 400 Ah, 4 800 Wh, 3 h 25 min
- 2010: 1 = VI, 2 = VFD, 3 = VFI
- VFI: 0 ms, teuer, schlechterer Wirkungsgrad
- Byte = 8 Bit, KiB 1 024, 1 MB/s = 8 Mbit/s, 500 GB = 465,66 GiB
