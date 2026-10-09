---
id: ap2-vertraege
bereich: AP2
block: A11
kapitel: Verträge
titel: Vertragsarten, Mängel, SLA
stufe: Fortgeschritten
quellen: [BGB, HGB, IHK-Prüfungskatalog]
verweise: [ap2-beschaffung, ap2-itil-monitoring, ap2-hochverfuegbarkeit]
---

## Profi

### Vertragsarten
| Vertrag | Schuldet | IT-Beispiel |
|---|---|---|
| **Kaufvertrag** (§ 433 BGB) | **Übergabe + Eigentum** gegen Geld | **Hardware, Standardsoftware** |
| **Werkvertrag** (§ 631) | **Erfolg** (fertiges Werk), **Abnahme** | **Netzwerk installieren**, **Individualsoftware** |
| **Dienstvertrag** (§ 611) | **Tätigkeit**, **kein Erfolg** | **Support-Stunden**, **Beratung** |
| **Werklieferungsvertrag** (§ 650) | Herstellung beweglicher Sache → **Kaufrecht** | **Maßgefertigter Server-Schrank** |
| **Mietvertrag** (§ 535) | **Gebrauchsüberlassung gegen Geld** | **Gerätemiete, SaaS** (oft) |
| **Leasingvertrag** | **Mischform**, **nicht im BGB geregelt** | **Notebooks** |
| **Arbeitsvertrag** | Weisungsgebundene Arbeit | Anstellung |

### Mängelarten
**Sachmangel** (Qualität, Montagemangel, falsche Montageanleitung, Falschlieferung, Zuweniglieferung), **Rechtsmangel** (Rechte Dritter, z. B. Lizenz fehlt).
**Offen** (sofort erkennbar), **versteckt** (später), **arglistig verschwiegen**.

### Rechte des Käufers (Gewährleistung)
1. **Vorrangig: Nacherfüllung** (**Nachbesserung** oder **Ersatzlieferung**, Käufer wählt).
2. **Nachrangig** (nach **Fristablauf/Fehlschlag**): **Rücktritt**, **Minderung**, **Schadensersatz**, **Ersatz vergeblicher Aufwendungen**.

**Fristen**: **2 Jahre ab Übergabe** (neue Ware), **arglistig: 3 Jahre ab Kenntnis**. **B2C: Beweislastumkehr 1 Jahr** (Mangel gilt als von Anfang an vorhanden). **B2B (HGB § 377)**: **unverzügliche Prüf- und Rügepflicht**.

### Gewährleistung vs. Garantie
**Gewährleistung** = **gesetzlich**, Verkäufer. **Garantie** = **freiwillig**, meist Hersteller, **Bedingungen frei**.

### Lieferverzug / Annahmeverzug / Zahlungsverzug
| | Voraussetzung | Rechte |
|---|---|---|
| **Lieferungsverzug** | Fällig + Mahnung (entbehrlich bei **Fixtermin**) + Verschulden | Lieferung + Schadensersatz, nach Nachfrist Rücktritt |
| **Zahlungsverzug** | **30 Tage nach Rechnung** (B2C mit Hinweis) oder Mahnung | Zinsen: **B2C 5 %**, **B2B 9 % über Basiszins**, **40 € Pauschale** B2B |
| **Annahmeverzug** | Käufer nimmt nicht an | Einlagerung, **Selbsthilfeverkauf** |

### SLA (Service Level Agreement)
**Vereinbarung zwischen Dienstleister und Kunde** über **messbare Dienstgüte**.
| Inhalt | Beispiel |
|---|---|
| **Verfügbarkeit** | **99,9 %** pro Monat |
| **Servicezeiten** | **Mo–Fr 8–17 Uhr** oder **24/7** |
| **Reaktionszeit** | **Beginn der Bearbeitung** in **1 h** |
| **Wiederherstellungszeit** | **Lösung/Workaround** in **4 h** |
| **Priorität/Eskalation** | P1–P4 mit Stufen |
| **Messung, Reporting** | Monatsbericht |
| **Pönale** | **Vertragsstrafe/Gutschrift** bei Verstoß |

**Verwandt**: **OLA** (Operational Level Agreement, **intern** zwischen Abteilungen), **UC** (Underpinning Contract, **mit externem Lieferanten**).

**Reaktionszeit ≠ Lösungszeit**. Wird nur in **Servicezeiten** gezählt.

### Datenschutzvertrag
**AVV** (**Auftragsverarbeitungsvertrag, Art. 28 DSGVO**) bei **Verarbeitung personenbezogener Daten** durch Dienstleister (Cloud, Wartung mit Datenzugriff).

## Einfach
**Kaufvertrag** = **Ware kaufen**. **Werkvertrag** = **der Handwerker muss fertig werden** (Erfolg). **Dienstvertrag** = **der Handwerker muss nur arbeiten**, egal ob fertig (wie Nachhilfe: die Stunde zählt, nicht die Note). **SLA** ist das **Versprechen**: „**Wenn’s kaputt ist, sind wir in 1 Stunde dran.**“

## Merksatz
- **Werk = Erfolg + Abnahme**, **Dienst = Tätigkeit**.
- **Erst Nacherfüllung, dann Rücktritt/Minderung/Schadensersatz**.
- **2 Jahre Gewährleistung**.
- **Gewährleistung Gesetz, Garantie freiwillig**.
- **SLA extern, OLA intern, UC Lieferant**.

## Prüfungsfalle
- **Support-Vertrag nach Stunden = Dienstvertrag**, **Installation mit Abnahme = Werkvertrag**.
- **Rücktritt sofort** geht **meist nicht** – erst **Nacherfüllung**.
- **Garantie ≠ Gewährleistung**.
- **Reaktionszeit** mit **Lösungszeit** verwechselt.
- **Servicezeiten** bei SLA-Berechnung **nicht beachtet**.
- **B2B**: **Mängel unverzüglich rügen**, sonst Rechte weg.

## Grafik
### Drei Handwerker
Käufer mit Karton (Kauf), Handwerker mit fertigem Netzwerk (Werk), Berater mit Stoppuhr (Dienst).

### Mängelrechte-Treppe
Stufe 1 Nacherfüllung, Stufe 2 Rücktritt/Minderung/Schadensersatz.

## Karteikarten
- F: Was schuldet ein Werkvertrag? | A: Einen Erfolg, der abgenommen wird.
- F: Was schuldet ein Dienstvertrag? | A: Eine Tätigkeit, keinen Erfolg.
- F: Vorrangiges Recht bei Mangel? | A: Nacherfüllung (Nachbesserung oder Ersatzlieferung).
- F: Gewährleistungsfrist bei Neuware? | A: 2 Jahre.
- F: Unterschied Garantie und Gewährleistung? | A: Gewährleistung gesetzlich, Garantie freiwillig.
- F: Was regelt ein SLA? | A: Messbare Servicequalität wie Verfügbarkeit und Reaktionszeit.
- F: Was ist ein OLA? | A: Interne Vereinbarung zwischen Abteilungen.
- F: Was ist ein AVV? | A: Auftragsverarbeitungsvertrag nach Art. 28 DSGVO.
- F: Verzugszinsen B2B? | A: 9 Prozentpunkte über Basiszins.

## Quiz
? Eine Firma installiert ein komplettes WLAN mit Abnahme. Vertragsart?
* Werkvertrag
- Dienstvertrag
- Kaufvertrag
- Mietvertrag

? Ein gekaufter Monitor ist defekt. Welches Recht zuerst?
* Nacherfüllung
- Rücktritt
- Schadensersatz
- Minderung

? Was beschreibt die Reaktionszeit im SLA?
* Zeit bis zum Bearbeitungsbeginn
- Zeit bis zur Lösung
- Monatliche Verfügbarkeit
- Vertragslaufzeit

? Welcher Vertrag wird bei Cloud-Dienstleistern mit personenbezogenen Daten gebraucht?
* Auftragsverarbeitungsvertrag
- Werklieferungsvertrag
- Leasingvertrag
- Arbeitsvertrag
