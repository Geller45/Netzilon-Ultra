---
id: netz-strukturierte-verkabelung
bereich: AP1
block: Netzwerk
kapitel: Physische Netzwerkstruktur
titel: Strukturierte Verkabelung nach ISO 11801 – Primär-, Sekundär-, Tertiärbereich, Komponenten und Kabelkategorien
stufe: Einsteiger
fach: ITK / Grundlagen
pruefungen: [AP1, Schule]
quellen: [XX_Strukturierte_Verkabelung.pdf]
verweise: [ap1-a4-topologie, ccna-kabel-schnittstellen, netz-ethernet-csma-cd-frame]
---

## Profi

### Idee
Die **strukturierte Verkabelung** (UGV – Universelle Gebäudeverkabelung, ISO/IEC 11801, Fassung 2002 in der Unterlage) liefert einen **einheitlichen, anwendungsneutralen Aufbauplan** für die Gebäudeverkabelung. Sie wird in **drei Bereiche** gegliedert.

### Die drei Bereiche
| Bereich | Verbindet | Verteiler | Kabel | Medium |
|---|---|---|---|---|
| **Primär** (Campus, Standortverkabelung) | Gebäude eines Standortes | Standortverteiler → Gebäudeverteiler | Primärkabel | meist **LWL** (Bandbreite, Unempfindlichkeit gegen elektromagnetische Störungen, **galvanische Trennung**, große Entfernung); Kupfer nur eingeschränkt |
| **Sekundär** (Steigbereich, vertikal, Gebäudeverkabelung) | Etagen eines Gebäudes | Gebäudeverteiler (Serverraum) → Etagenverteiler | Sekundärkabel | LWL oder Kupfer (Twisted Pair) |
| **Tertiär** (Etagenverkabelung, horizontal) | Etagenverteiler → Anschlussdosen | Etagenverteiler | Tertiärkabel | überwiegend **Kupfer (Twisted Pair)** |
Merkmale: Primär = große Entfernung, hohe Datenraten, **wenige** Anschlusspunkte; Tertiär = kurze Strecken, **viele** Anschlusspunkte.

### Komponenten
- **Verteilerschrank** (19-Zoll-Schrank): Schaltschränke für Etagen- und Gebäudeverteiler; enthalten oft Switches, Hubs (Legacy) und Telefonanlagen.
- **Patchpanel (Rangierfeld):** Verbindungen enden auf der **Rückseite** (fest verlegte Installationskabel) und werden **vorne** über Patchkabel flexibel weitergenutzt.
- **Patchkabel:** meist kurz (Kupfer oder LWL); verbindet die Vorderseite des Patchpanels mit Switch/Router.
- **Anschlussdose (Wanddose):** verbindet den Wandanschluss mit der Rückseite des Patchpanels; **Beschriftung** entspricht der der Panel-Ports.

### Signalweg
Endgerät → Patchkabel → Anschlussdose → Tertiärkabel → Patchpanel (Etagenverteiler) → Patchkabel → Etagen-Switch → Sekundärkabel (Steigleitung) → Gebäudeverteiler → Primärkabel → anderes Gebäude.

### Twisted-Pair-Kategorien
| Kategorie | Eignung / Bemerkung |
|---|---|
| Cat 1 | nicht für Ethernet, „Klingeldraht“ |
| Cat 2 | nicht für Ethernet, ISDN |
| Cat 3 | 10–100 Mbit/s, ISDN-tauglich, vor allem USA |
| Cat 4 | meist 16 Mbit/s, kaum verwendet, von Cat 5 ersetzt |
| Cat 5(e) | 100 Mbit/s bis 1 Gbit/s (5e), lange Standard der strukturierten Verkabelung |
| Cat 6 | bis 10 Gbit/s (auf kürzeren Strecken), bis 100 m Kanal |
| Cat 7 | bis 10 Gbit/s, spezielle Stecker (GG45, TERA) |
| Cat 8 | bis 40 Gbit/s, ab 2016 (kurze Strecken, Rechenzentrum) |

## Einfach

Denk an ein **großes Schulgelände mit mehreren Gebäuden**. Damit überall Netzwerk ankommt, plant man die Kabel in **drei Stufen**, wie Straßen:

1. **Primär** = die „Autobahn“ zwischen den Gebäuden. Wenige, aber sehr schnelle Verbindungen, meist **Glasfaser**.
2. **Sekundär** = der „Aufzug“ im Gebäude: Er bringt das Netz von unten (Serverraum) in jede Etage.
3. **Tertiär** = die „Flurstraße“ in der Etage: Von einem Schrank gehen viele dünne Kabel zu den **Wanddosen** in den Räumen. Das ist meist **Kupfer**.

Der **Verteilerschrank** ist wie ein Hauptverteiler für Strom, nur für Netzwerk. Im Schrank hängt ein **Patchpanel**, das ist eine Steckerleiste: hinten sind die fest verlegten Kabel angeschlossen, vorn steckst du mit kurzen **Patchkabeln** auf den Switch. Möchtest du etwas ändern, steckst du nur um – du musst nie die Wand aufmachen. Wanddose und Patchpanel haben dieselbe **Nummer**, so findest du das richtige Kabel schnell.

Kabel haben auch **Noten** (Kategorien): Je höher die Zahl (Cat 5e, 6, 7, 8), desto schneller kann das Kabel Daten tragen.

Ein Beispiel: Philipp steckt in Raum 101 sein Notebook in die Dose „1.01“. Hinter der Wand läuft ein Kabel in den Etagenschrank und endet hinten am Patchpanel auf Port „1.01“. Vorne verbindet ein kurzes blaues Patchkabel diesen Port mit dem Switch. Der Switch hängt über die „Steigleitung“ (Sekundär) am Serverraum, und der Serverraum über die „Autobahn“ (Primär, Glasfaser) am Nachbargebäude. Fällt die Dose aus, tauscht man nur das Patchkabel oder steckt auf einen anderen Port um.

## Merksatz
- **Primär = zwischen Gebäuden (LWL), Sekundär = zwischen Etagen (Steigbereich), Tertiär = in der Etage zur Dose (Kupfer).**
- **Patchpanel: hinten fest, vorne flexibel.**
- **Cat 5e = 1 Gbit, Cat 6 = 10 Gbit (kurz), Cat 7 = GG45/TERA, Cat 8 = 40 Gbit.**
- **Maximale Kanallänge Twisted Pair = 100 m.**

## Prüfungsfalle
- Primär/Sekundär/Tertiär nicht verwechseln: **Primär = Gelände (Campus), Sekundär = vertikal, Tertiär = horizontal**.
- Die Unterlage nennt für Cat 6 „10 Gbit für Strecken bis 100 m“. Genauer: Cat 6 schafft 10 GBase-T nur bis ca. **55 m**, erst Cat 6A bis 100 m. Cat 7 „1 bis 10 Gbit“ nach Unterlage; der Standard erlaubt 10 Gbit bis 100 m.
- „ISO 11801:2002“ ist ein älterer Stand; er wurde mehrfach überarbeitet (Edition 2.0 2002, später 2010/2017).
- Hubs im Verteilerschrank sind **Legacy**; heute Switches.
- Patchkabel ≠ Installationskabel: Das Verlegekabel (starr) liegt hinter dem Panel, das flexible Patchkabel vorn.

## Grafik
### Aufbau der Gebäudeverkabelung
1. Standortverteiler: Ausgangspunkt auf dem Gelände
2. Standortverteiler -> Gebäudeverteiler: Primärkabel (LWL)
3. Gebäudeverteiler -> Etagenverteiler: Sekundärkabel (Steigleitung)
4. Etagenverteiler: Patchpanel Rückseite – Installationskabel
5. Etagenverteiler -> Anschlussdose: Tertiärkabel (Twisted Pair)
6. Anschlussdose -> PC: Patchkabel zum Endgerät
7. Text: Beschriftung der Dose = Beschriftung des Panel-Ports

## Lab
### Cisco IOS
Gerät: **SW-Etage1** (Etagenverteiler), Uplink zum Gebäudeverteiler über LWL (Gi0/1), Anschlussdosen an Fa0/1–24. Ports nach Patchpanel beschriften und prüfen:
```
SW-Etage1> enable
SW-Etage1# configure terminal
SW-Etage1(config)# interface fastEthernet 0/1
SW-Etage1(config-if)# description Dose 1.01 - Patchpanel A Port 01 - Raum 101
SW-Etage1(config-if)# interface gigabitEthernet 0/1
SW-Etage1(config-if)# description UPLINK Sekundaer LWL zu SW-Gebaeude
SW-Etage1(config-if)# end
SW-Etage1# show interfaces description
SW-Etage1# show interfaces status
SW-Etage1# show cdp neighbors
SW-Etage1# show interfaces gigabitEthernet 0/1 transceiver
```
Beobachtung: `description` bildet die Dosenbeschriftung im Gerät ab (Dokumentation!); `show cdp neighbors` zeigt, welches Gerät am Uplink hängt; Fehlerzähler (CRC/input errors) deuten auf schlechte Kabel/Patchungen.

## Befehle
- `description <Text>` – Port mit Dosen-/Panelnummer beschriften
- `show interfaces description` – Beschriftungen aller Ports
- `show interfaces status` – Status, Speed, Duplex, Medium
- `show cdp neighbors` – direkt angeschlossene Cisco-Nachbarn (Patch-Kontrolle)
- `show interfaces <if> transceiver` – optische Pegel bei LWL (SFP)

## Übungen
- A: Nenne die drei Bereiche der strukturierten Verkabelung. | L: Primär (Gelände/Standort), Sekundär (Steigbereich/Gebäude), Tertiär (Etage/horizontal).
- A: Welches Kabel wird im Primärbereich bevorzugt und warum? | L: LWL – hohe Bandbreite, große Entfernung, unempfindlich gegen elektromagnetische Störungen, galvanische Trennung.
- A: Wozu dient ein Patchpanel? | L: Rangierfeld: Installationskabel hinten fest, vorne flexibel mit Patchkabeln zu Switch/Router.
- A: Welche Norm beschreibt die Gebäudeverkabelung? | L: ISO/IEC 11801 (UGV – Universelle Gebäudeverkabelung).
- A: Ordne zu: Cat 5e, Cat 6, Cat 7, Cat 8. | L: 1 Gbit, 10 Gbit, 10 Gbit mit GG45/TERA, 40 Gbit.
- A: Wie heißen die Bestandteile einer Strecke von der Dose zum Switch? | L: Anschlussdose, Tertiärkabel, Patchpanel (Rück-/Vorderseite), Patchkabel, Switch.

## Karteikarten
- F: Was bedeutet UGV? | A: Universelle Gebäudeverkabelung (strukturierte Verkabelung).
- F: Welche Norm regelt die strukturierte Verkabelung? | A: ISO/IEC 11801.
- F: In welche Bereiche wird sie gegliedert? | A: Primär-, Sekundär- und Tertiärbereich.
- F: Was verbindet der Primärbereich? | A: Die Gebäude eines Standortes.
- F: Was verbindet der Sekundärbereich? | A: Die Etagen eines Gebäudes (Steigbereich).
- F: Was verbindet der Tertiärbereich? | A: Etagenverteiler und Anschlussdosen (horizontal).
- F: Typisches Medium im Tertiärbereich? | A: Kupfer (Twisted Pair).
- F: Wozu ein Patchpanel? | A: Zum flexiblen Rangieren zwischen festen Kabeln und Netzwerkgeräten.
- F: Wie groß ist ein Verteilerschrank-Rastermaß? | A: 19 Zoll.
- F: Welche Kategorie ist Standard der strukturierten Verkabelung (klassisch)? | A: Cat 5(e).
- F: Welche Stecker nutzt Cat 7 zusätzlich? | A: GG45 und TERA.
- F: Welche Datenrate bietet Cat 8? | A: 40 Gbit/s (ab 2016).

## Quiz
? Welcher Bereich verkabelt die Gebäude eines Standortes untereinander?
* Primärbereich
- Sekundärbereich
- Tertiärbereich
- Endgerätebereich
? Welcher Bereich heißt auch Steigbereichverkabelung?
* Sekundärbereich
- Primärbereich
- Tertiärbereich
- Campusbereich
? Welches Medium wird im Tertiärbereich überwiegend genutzt?
* Twisted-Pair-Kupfer
- Koaxialkabel
- Einmodenfaser
- Stromleitung
? Warum ist LWL im Primärbereich vorteilhaft?
* Hohe Bandbreite, große Reichweite, Störunempfindlichkeit, galvanische Trennung
- Es ist billiger als Kupfer
- Es lässt sich ohne Werkzeug spleißen
- Es versorgt Geräte mit PoE
? Wofür steht UGV?
* Universelle Gebäudeverkabelung
- Universelle Geräteverbindung
- Unified Gigabit Verbindung
- Unterputz-Gebäude-Verteilung
? Wo werden Patchkabel angeschlossen?
* Vorderseite des Patchpanels und Netzwerkgerät
- Rückseite des Patchpanels und Wanddose
- Standortverteiler und Gebäudeverteiler
- Nur an Glasfaser-Spleißboxen
? Welche Kategorie benötigt die Spezialstecker GG45 oder TERA?
* Cat 7
- Cat 5e
- Cat 6
- Cat 3
? Welche Datenrate bietet Cat 8?
* 40 Gbit/s
- 100 Mbit/s
- 1 Gbit/s
- 400 Gbit/s
? Welche Maßangabe gilt für Verteilerschränke?
* 19 Zoll
- 21 Zoll
- 10 Zoll
- 24 Zoll
? Welche Kategorie wird als „Klingeldraht“ bezeichnet?
* Cat 1
- Cat 3
- Cat 5
- Cat 7
@ XX_Strukturierte_Verkabelung.pdf
