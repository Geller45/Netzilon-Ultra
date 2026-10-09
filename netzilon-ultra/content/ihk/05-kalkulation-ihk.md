---
id: ihk-kalkulation
bereich: AP1
block: IHK
kapitel: Entscheidung und Wirtschaftlichkeit
titel: IHK-Rechenaufgaben – Angebotskalkulation, Stundensatz, Stromkosten, Dateigröße
stufe: Fortgeschritten
fach: PV – AP1
pruefungen: [AP1, AP2]
quellen: [Berechnungen.docx, Lernzettel_AP1AP2_2024.pdf, AP1_Lernplan_1.pdf, 3fd94b97-AP1_Lernplan__1_.md, Abschlussprüfung_Lernzettel.pdf, kaufmaennisch_80.md (Abschnitt E), USV & Stromversorgung.docx]
verweise: [wiso-kalkulation, wiso-kostenrechnung, ihk-nutzwertanalyse, ihk-pruefungsaufbau]
---

## Profi

### Typische Rechenaufgaben in der AP1/AP2
1. **Angebotskalkulation / Einstandspreis**: Listenpreis − Rabatt − Skonto + Bezugskosten (`wiso-kalkulation`).
2. **Stromkosten**: Kosten = (Leistung in W : 1000) × Stunden × Tage × Preis/kWh. Beispiel: 150 W, 24 h, 365 Tage, 0,32 €/kWh → 0,15 × 24 × 365 = 1.314 kWh → **420,48 €**. Mit Wirkungsgrad η = Nutzleistung : Eingangsleistung: Eingangsleistung = Nutzleistung : η.
3. **Amortisation / Wirtschaftlichkeit**: Investition : jährlicher Rückfluss; Vergleich Kauf/Leasing/Miete über Laufzeit.
4. **Stundensatz und Arbeitszeit**: Personalkosten = Stunden × Satz; Aufschläge für Projektleitung; produktive Stunden. Beispiel: 3 Techniker × 8 h × 70 €/h = 1.680 €.
5. **Dateigröße und Übertragung**: Bild = Breite × Höhe × Farbtiefe (Bit) : 8 → Byte. Beispiel 1920×1080 mit 24 Bit = 6.220.800 Byte ≈ 5,93 MiB. Übertragungsdauer t = Datenmenge (Bit) : Bandbreite (Bit/s). Beispiel 500 MB über 100 Mbit/s: 500 × 8 = 4.000 Mbit : 100 = **40 s** (ohne Protokoll-Overhead; mit Overhead ~ 10 % länger). **Dezimal vs. binär**: 1 GB = 10⁹ B, 1 GiB = 2³⁰ B.
6. **Verfügbarkeit**: (Betriebszeit − Ausfall) : Betriebszeit.
7. **RAID-Nettokapazität**: RAID 0 = n·C, RAID 1 = C (Spiegel), RAID 5 = (n−1)·C, RAID 6 = (n−2)·C, RAID 10 = n·C/2.
8. **Backup-Speicher**: Voll + Differenz (wächst) + Inkremental (nur Änderung).
9. **Subnetting/Hosts**: 2ⁿ − 2.
10. **USV-Laufzeit**: Energie (Wh) : Leistung (W); Scheinleistung VA = V × A; Wirkleistung W = VA × cos φ.

### Schema für gute Rechenwege
Gegeben → Gesucht → Formel → Einsetzen mit Einheiten → Ergebnis mit Einheit → Plausibilität/Antwortsatz.

### Rundungsregel
Geld auf Cent (2 Nachkommastellen), Zwischenergebnisse nicht zu früh runden.

## Einfach

Rechenaufgaben in der IHK sind **immer nach demselben Muster**. Wenn du das Muster kennst, sind es geschenkte Punkte.

**Stromkosten (Beispiel Spielekonsole):** Sie braucht 150 Watt. 1000 Watt sind 1 Kilowatt, also sind 150 W = 0,15 kW. Wenn sie 24 Stunden läuft, sind das 0,15 × 24 = 3,6 kWh pro Tag. Eine Kilowattstunde kostet z. B. 32 Cent. Also 3,6 × 0,32 = 1,15 € pro Tag. Mal 365 Tage: etwa 420 €. Immer vier Schritte: **W : 1000, mal Stunden, mal Preis, mal Tage**.

**Datenmengen:** 1 Byte = 8 Bit. Wenn du ein Foto mit 1920×1080 Bildpunkten hast und jeder Bildpunkt 24 Bit (3 Byte) braucht, rechnest du 1920 × 1080 × 3 Byte. Das sind etwa 6 Millionen Byte, also 6 MB.

**Wie lange dauert es zu senden?** Dein Internet schafft 100 Megabit pro Sekunde. Dateien werden aber in Megabyte angegeben. 1 Byte = 8 Bit. 500 MB sind also 4.000 Mbit. 4.000 : 100 = 40 Sekunden. Merke: **Dateigröße × 8 : Bandbreite**.

**Stundensatz:** Ein Techniker kostet 70 € pro Stunde. 3 Techniker, 8 Stunden: 3 × 8 × 70 = 1.680 €. Erst Stunden zählen, dann Satz.

**Kleine Hilfen:**
- Lege eine Mini-Tabelle an (Gegeben / Gesucht / Formel / Ergebnis).
- Einheiten immer mitschreiben und kürzen: W, kW, kWh, €.
- Am Schluss: Ist das Ergebnis vernünftig?

## Merksatz
- Strom: W : 1000 × h × Preis.
- Übertragung: Byte × 8 : Bit pro Sekunde.
- RAID 5 = n−1, RAID 6 = n−2, RAID 10 = n/2 (alle × Plattengröße).
- Immer Einheit, immer Rechenweg.

## Prüfungsfalle
- **Bit vs. Byte**: Bandbreite in Bit/s, Dateien in Byte.
- Watt und Kilowatt verwechselt (Faktor 1000).
- GB (10⁹) vs. GiB (2³⁰): Aufgabentext beachten.
- RAID-Kapazität: Nettokapazität, nicht Brutto.
- Zu früh gerundet → Ergebnis weicht ab.
- Prozente: 19 % USt bedeutet ×1,19 bzw. :1,19.

## Grafik
### Übertragungszeit berechnen
1. Dateigröße: 500 MB
2. Umrechnung: 500 MB × 8 = 4.000 Mbit
3. Bandbreite: 100 Mbit/s
4. Division: 4.000 Mbit : 100 Mbit/s
5. Ergebnis: 40 Sekunden (ohne Overhead)

## Übungen
- A: Server 300 W, Dauerbetrieb, 0,30 €/kWh. Stromkosten pro Jahr? | L: 0,3 kW × 24 × 365 = 2.628 kWh × 0,30 = 788,40 €
- A: 2 GB Backup über 50 Mbit/s. Dauer? | L: 2.000 MB × 8 = 16.000 Mbit : 50 = 320 s ≈ 5 min 20 s
- A: 6 Platten à 4 TB in RAID 5. Nettokapazität? | L: (6 − 1) × 4 = 20 TB
- A: Netzteil mit Wirkungsgrad 80 % liefert 400 W. Aufnahmeleistung? | L: 400 : 0,8 = 500 W

## Karteikarten
- F: Stromkosten pro Jahr berechnen? | A: kW × Stunden/Tag × Tage × Preis/kWh
- F: 1 Byte in Bit? | A: 8 Bit
- F: Übertragungsdauer? | A: Datenmenge in Bit : Bandbreite in Bit/s
- F: Bildgröße berechnen? | A: Breite × Höhe × Farbtiefe (Bit) : 8
- F: RAID 5 Nettokapazität? | A: (n − 1) × Plattengröße
- F: RAID 10 Nettokapazität? | A: n : 2 × Plattengröße
- F: Wirkungsgrad? | A: Nutzleistung : Eingangsleistung
- F: GB vs. GiB? | A: 10⁹ Byte vs. 2³⁰ Byte
- F: Gegeben-Gesucht-Schema? | A: Gegeben, Gesucht, Formel, Einsetzen, Ergebnis mit Einheit, Plausibilität
- F: Verfügbarkeit berechnen? | A: (Betriebszeit − Ausfallzeit) : Betriebszeit

## Quiz
? Wie viele Bit hat ein Byte?
* 8
- 4
- 10
- 16

? Ein Gerät mit 200 W läuft 10 h am Tag. Wie hoch ist der Verbrauch pro Tag?
* 2 kWh
- 20 kWh
- 0,2 kWh
- 200 kWh

? 800 MB sollen über 100 Mbit/s übertragen werden. Dauer ohne Overhead?
* 64 s
- 8 s
- 80 s
- 6,4 s

? Nettokapazität von RAID 5 mit 4 Platten à 2 TB?
* 6 TB
- 8 TB
- 4 TB
- 2 TB

? Nettokapazität von RAID 10 mit 4 Platten à 2 TB?
* 4 TB
- 8 TB
- 6 TB
- 2 TB

? Netzteil liefert 300 W bei 75 % Wirkungsgrad. Aufnahmeleistung?
* 400 W
- 225 W
- 300 W
- 375 W

? Welche Einheit hat die Bandbreite typischerweise?
* Bit pro Sekunde
- Byte
- Watt
- Hertz

? Wie berechnet man die Bildgröße eines unkomprimierten Bildes?
* Breite × Höhe × Farbtiefe : 8
- Breite + Höhe
- Breite : Höhe
- Pixelanzahl × 1000
