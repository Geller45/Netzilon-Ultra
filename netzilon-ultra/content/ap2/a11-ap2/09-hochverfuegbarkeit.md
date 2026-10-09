---
id: ap2-hochverfuegbarkeit
bereich: AP2
block: A11
kapitel: Verfügbarkeit
titel: Hochverfügbarkeit, Verfügbarkeitsberechnung, RAID, USV
stufe: Fortgeschritten
quellen: [IHK-Prüfungskatalog, BSI Hochverfügbarkeitskompendium]
verweise: [ap2-backup-speicher, ap2-vertraege, az801-failover-cluster]
---

## Profi

### Verfügbarkeit
**Verfügbarkeit = MTBF ÷ (MTBF + MTTR)** bzw. **(Gesamtzeit − Ausfallzeit) ÷ Gesamtzeit**.
- **MTBF**: Mean Time **Between** Failures (mittlere Betriebszeit zwischen Ausfällen).
- **MTTR**: Mean Time **To Repair** (mittlere Reparaturzeit).
- **MTTF**: Mean Time To Failure (nicht reparierbare Komponenten).

### Verfügbarkeitsklassen (Ausfall pro Jahr, 8.760 h)
| Verfügbarkeit | Ausfall/Jahr | Ausfall/Monat (30 Tage) |
|---|---|---|
| **99 %** | **87,6 h** (~3,65 Tage) | 7,2 h |
| **99,5 %** | 43,8 h | 3,6 h |
| **99,9 %** | **8,76 h** | 43,2 min |
| **99,99 %** | **52,56 min** | 4,32 min |
| **99,999 %** | **5,26 min** | 26 s |

### Serien- und Parallelschaltung
- **Seriell** (alle nötig): **V = V1 × V2 × …** → **Gesamt schlechter**.
  Beispiel: Router 99 % × Switch 99 % × Server 99 % = **97,03 %**.
- **Parallel** (einer reicht): **V = 1 − (1 − V1) × (1 − V2)** → **Gesamt besser**.
  Beispiel: zwei Server à 99 %: 1 − 0,01 × 0,01 = **99,99 %**.

### SPOF
**Single Point of Failure** = **Komponente ohne Redundanz**, deren Ausfall **alles stoppt**. **Beseitigen durch Redundanz**: **Netzteile, NICs (Teaming), Switches (Stack), Leitungen, Cluster, RAID, USV, zweiter Standort**.

### RAID
| RAID | Mindest-Platten | Nutzkapazität | Ausfallsicherheit | Merkmal |
|---|---|---|---|---|
| **0** (Striping) | 2 | **100 %** | **Keine** | **Schnell** |
| **1** (Mirroring) | 2 | **50 %** | **1 Platte** | Spiegel |
| **5** (Parität verteilt) | 3 | **(n−1) × Größe** | **1 Platte** | Guter Kompromiss, langsames Schreiben/Rebuild |
| **6** (doppelte Parität) | 4 | **(n−2) × Größe** | **2 Platten** | Große Arrays |
| **10** (1+0) | 4 | **50 %** | **1 je Spiegel** | Schnell + sicher |
| **50/60** | 6/8 | Kombination | | Große Systeme |

**Hot Spare** = **Ersatzplatte springt automatisch ein**. **RAID ist kein Backup!**
Beispiel: 4 × 4 TB RAID 5 → **12 TB**; RAID 6 → **8 TB**; RAID 10 → **8 TB**.

### Parität (RAID 5) – XOR
Daten 1011, 0110 → Parität **1101** (XOR). Fällt Platte 1 aus: 0110 XOR 1101 = **1011**.

### USV (Unterbrechungsfreie Stromversorgung)
| Klasse (IEC 62040-3) | Name | Merkmal |
|---|---|---|
| **VFD** | **Offline/Standby** | **Umschaltzeit** (ms), günstig, PCs |
| **VI** | **Line-Interactive** | **Spannungsregelung**, kurze Umschaltung |
| **VFI** | **Online/Doppelwandler** | **Keine Umschaltzeit**, **höchster Schutz**, Server |

**Dimensionierung**: **Scheinleistung S (VA) = Wirkleistung P (W) ÷ Leistungsfaktor (cos φ)**. **Reserve ~20–30 %**. **Überbrückungszeit**, **geordnetes Herunterfahren** (Software/USB/SNMP).
Beispiel: 1.200 W, cos φ 0,8 → **1.500 VA**, mit 25 % Reserve **1.875 VA**.

### Weitere HA-Techniken
**Failover-Cluster**, **Load Balancing**, **Virtualisierungs-HA** (Neustart auf anderem Host), **Live Migration**, **Replikation**, **Georedundanz**, **Link Aggregation (LACP)**, **Redundante Router (VRRP/HSRP)**, **STP/RSTP** (Schleifen verhindern), **Dual-Homing**.

## Einfach
**Verfügbarkeit** = **wie oft ist der Laden offen**. **99,9 %** klingt viel, heißt aber **fast 9 Stunden Pause im Jahr**. **Seriell** = **Kette**: **Ein Glied reißt, alles kaputt** – je mehr Glieder, desto schlechter. **Parallel** = **zwei Seile**: **Eins reißt, das andere hält**. **RAID 1** = **Abschreiben ins zweite Heft**. **USV** = **Akku-Powerbank für den Server**.

## Merksatz
- **V = MTBF ÷ (MTBF + MTTR)**.
- **Seriell multiplizieren, parallel 1 − Produkt der Ausfälle**.
- **99,9 % ≈ 8,76 h/Jahr**, **99,99 % ≈ 53 min**.
- **RAID 5: n−1**, **RAID 6: n−2**, **RAID 1/10: Hälfte**.
- **RAID ist kein Backup**.
- **VA = W ÷ cos φ**, **Online-USV für Server**.

## Prüfungsfalle
- **Serielle** Verfügbarkeit wird **schlechter** als jede einzelne.
- **Parallel** nicht **addieren**, sondern **1 − (1−a)(1−b)**.
- **RAID 0** hat **keine** Ausfallsicherheit.
- **Watt/VA** verwechselt.
- **Stunden vs. Minuten** umrechnen (× 60).
- **Gesamtzeit** laut Aufgabe (Monat 30 Tage? 24/7 oder nur Servicezeit?).

## Grafik
### Kette und Seile
Kette aus 3 Gliedern (seriell), zwei parallele Seile.

### RAID-Bilder
RAID 0 abwechselnd verteilt, RAID 1 gespiegelt, RAID 5 mit wanderndem P.

## Übungen
- A: MTBF 2.000 h, MTTR 10 h. Verfügbarkeit? | L: 2000 ÷ 2010 = 99,50 %.
- A: Firewall 99,9 %, Switch 99,95 %, Server 99,8 % seriell? | L: 0,999 × 0,9995 × 0,998 = 99,65 %.
- A: SLA 99,5 % im 30-Tage-Monat. Erlaubter Ausfall? | L: 720 h × 0,005 = 3,6 h.
- A: 6 × 2 TB in RAID 6. Nutzkapazität? | L: 8 TB.
- A: Server 900 W, cos φ 0,9. Scheinleistung? | L: 1.000 VA.

## Karteikarten
- F: Formel Verfügbarkeit mit MTBF/MTTR? | A: MTBF ÷ (MTBF + MTTR).
- F: Wie berechnet man serielle Verfügbarkeit? | A: Einzelverfügbarkeiten multiplizieren.
- F: Wie berechnet man parallele Verfügbarkeit? | A: 1 − Produkt der Ausfallwahrscheinlichkeiten.
- F: Ausfallzeit bei 99,9 % pro Jahr? | A: 8,76 Stunden.
- F: Nutzkapazität RAID 5? | A: (n − 1) × Plattengröße.
- F: Wie viele Platten darf RAID 6 verlieren? | A: 2.
- F: Was ist ein SPOF? | A: Komponente ohne Redundanz, deren Ausfall alles stoppt.
- F: Welche USV hat keine Umschaltzeit? | A: Online-USV (VFI).
- F: Formel Scheinleistung? | A: Wirkleistung ÷ Leistungsfaktor.
- F: Was ist ein Hot Spare? | A: Ersatzplatte, die automatisch einspringt.

## Quiz
? Zwei Komponenten mit je 99 % sind parallel geschaltet. Gesamtverfügbarkeit?
* 99,99 %
- 98,01 %
- 99 %
- 198 %

? Wie viel Nutzkapazität haben 4 × 3 TB in RAID 5?
* 9 TB
- 12 TB
- 6 TB
- 3 TB

? Welche USV eignet sich für kritische Server?
* Online-USV (VFI)
- Offline-USV (VFD)
- Keine
- Powerbank

? Welcher RAID-Level bietet keine Redundanz?
* RAID 0
- RAID 1
- RAID 5
- RAID 10

? Wie viel Ausfall erlaubt 99,99 % pro Jahr ungefähr?
* 53 Minuten
- 8,76 Stunden
- 3,65 Tage
- 5 Minuten

? Zwei Komponenten mit je 99 % Verfügbarkeit sind in Reihe geschaltet. Wie hoch ist die Gesamtverfügbarkeit?
* 98,01 %
- 99,99 %
- 99 %
- 198 %
! Reihe: Produkt der Verfügbarkeiten (0,99 × 0,99).

? Was bedeutet „Single Point of Failure“?
* Eine Komponente, deren Ausfall das Gesamtsystem lahmlegt
- Eine besonders zuverlässige Komponente
- Der erste Fehler in einem Log
- Ein redundanter Server
! Hochverfügbarkeit beseitigt SPOFs durch Redundanz.

? Was beschreibt die MTBF?
* Mittlere Betriebszeit zwischen zwei Ausfällen
- Mittlere Reparaturzeit
- Maximale Datenrate
- Mindestlaufzeit der USV
! Verfügbarkeit ≈ MTBF ÷ (MTBF + MTTR).
