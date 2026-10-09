---
id: server-hw-rechneraufbau-uebung
bereich: AP1
pruefungen: [AP1, Schule]
fach: ITK / Grundlagen
block: S3
kapitel: Hardware
titel: Rechneraufbau allgemein – Übung 01 komplett gelöst
stufe: Einsteiger
typ: uebung
quellen: [01_Übung_Rechneraufbau_allgemein.pdf]
verweise: [ap1-a1-rechneraufbau, ap1-a1-prozessor, ap1-a1-mainboard, server-hw-eva, server-hw-rechenaufgaben]
---

## Profi

Die Theorie (Rechnertypen, Formfaktoren, Kühlung) steht im Thema **Rechneraufbau & Rechnertypen** (ap1-a1-rechneraufbau). Hier die **10 Aufgaben der Übung 01** mit Musterlösungen. Recherche-Aufgaben (3, 4, 8, 10) sind mit typischen Beispielwerten gelöst – im Unterricht kann man eigene Modelle wählen.

### Kernwissen kurz
- **Rechnertypen** richten sich nach dem Einsatz: Desktop, Thin Client, HTPC, Green-PC, Workstation, Gaming-PC, Server.
- **Multi-Core** = mehrere Kerne in **einem** Prozessorgehäuse (Desktop). **Multi-CPU** = mehrere **physische Prozessoren** in mehreren Sockeln (Server, 2 oder 4 Sockel) mit eigenem Speichercontroller → **NUMA**, mehr RAM-Kanäle, mehr PCIe-Lanes, Redundanz.
- **Kühlung**: Desktops mit großen, langsamen Lüftern (leise), Luft- oder AiO-Wasserkühlung; Server mit **Front-to-Back-Luftstrom**, kleinen hochdrehenden, **redundanten, hot-swap-fähigen** Lüftern, passiven Kühlkörpern im Luftkanal; im Rechenzentrum **Warm-/Kaltgang** und zunehmend **Flüssigkühlung** (Direct-to-Chip, Immersion).
- **Temperaturmanagement im Gehäuse**: kalte Luft **vorne unten** rein, warme Luft **hinten oben** raus (warme Luft steigt); Netzteil heute meist **unten** mit eigenem Luftweg; Kabelmanagement für freien Luftstrom; CPU-Kühler bläst nach hinten zum Hecklüfter; Grafikkarte bekommt Frischluft von vorn.

## Einfach

Computer sind wie **Fahrzeuge**: Für jede Aufgabe gibt es das passende.
- Der **Desktop-PC** ist der **Familienkombi** – kann alles ein bisschen.
- Der **Thin Client** ist ein **Fahrrad mit Anhänger an der S-Bahn**: Er selbst ist schwach, die eigentliche Arbeit macht ein großer Server im Rechenzentrum.
- Der **HTPC** ist das **Wohnmobil** fürs Wohnzimmer: leise, hübsch, guckt Filme in 4K.
- Der **Green-PC** ist das **Elektroauto**: sparsam und leise.
- Der **Gaming-PC** ist der **Sportwagen**: schnell, aber schluckt viel Strom.
- Der **Server** ist der **Lkw**: läuft Tag und Nacht, hat Ersatzteile an Bord (zwei Netzteile, mehrere Lüfter) und ist laut – er steht ja nicht im Wohnzimmer.

Beim Kühlen gilt wie im Haus: **Warme Luft steigt nach oben**. Deshalb kommt frische Luft **unten vorne** rein und warme **oben hinten** raus.

## Merksatz
- **Multi-Core = viele Kerne, ein Sockel; Multi-CPU = viele Sockel.**
- **Vorne/unten rein, hinten/oben raus.**
- **Server: redundant, hot-swap, Front-to-Back.**
- Stromkosten = **Watt × Stunden ÷ 1000 × Preis**.

## Prüfungsfalle
- Thin Clients sind **nicht** einfach „schwache PCs“ – sie brauchen einen **Terminal-/VDI-Server**.
- Bei Stromkosten **W in kW** umrechnen (÷ 1000).
- Optische Laufwerke sind **nicht verschwunden**, aber für Installationen/Medien durch USB, Download und Streaming ersetzt.

## Grafik
### Luftstrom im Midi-Tower
1. Frontlüfter -> Gehäuse: kalte Luft vorne unten
2. Gehäuse -> Grafikkarte: Frischluft
3. Gehäuse -> CPU-Kühler: Luft nach hinten
4. CPU-Kühler -> Hecklüfter: warme Luft hinten raus
5. Gehäuse -> Deckellüfter: aufsteigende Wärme oben raus

## Übungen
- A: 1. Hardware-Anforderungen an Desktop-PC, Thin Client, HTPC und Green-PC | L: Desktop: aktuelle Mehrkern-CPU, 16–32 GB RAM, NVMe-SSD, iGPU oder Mittelklasse-GPU, Gigabit-LAN, ausreichend USB. Thin Client: sparsame CPU (ARM/Low-Power x86), 4–8 GB RAM, kleiner Flash, lüfterlos, Netzwerk + Monitoranschlüsse, Remote-Protokolle (RDP, ICA, Horizon). HTPC: kompaktes leises Gehäuse (Mini-ITX), Hardware-Decoder für HEVC/AV1, HDMI 2.1, HDR, gute Audioausgabe, Fernbedienung, große SSD/NAS-Anbindung. Green-PC: CPU mit niedriger TDP, effizientes Netzteil (80 PLUS Gold/Platinum), SSD, keine dedizierte GPU, Energiesparmodi, Umweltsiegel (Energy Star, Blauer Engel, TCO).
- A: 2. Energieverbrauch Desktop vs. Green-PC vs. Gaming (Beispiel 8 h/Tag, 220 Tage, 0,35 €/kWh) | L: Desktop 80 W → 80 × 8 × 220 = 140 800 Wh = 140,8 kWh → 49,28 €. Green-PC 35 W → 61,6 kWh → 21,56 €. Gaming-PC 400 W → 704 kWh → 246,40 €. Der Gaming-PC kostet unter Last etwa das Fünffache des Desktops.
- A: 3. Beispiel-Komplettsystem und optimale Einsatzgebiete | L: z. B. Business-Desktop mit Intel Core Ultra 5 / AMD Ryzen 5, 16 GB DDR5, 512 GB NVMe, iGPU, Wi-Fi 6E, TPM 2.0, vPro/DASH: leise, sparsam, fernverwaltbar → Büroarbeitsplatz, Verwaltung. Gaming-System mit 8-Kern-CPU, 32 GB, RTX-GPU → Spiele, Videoschnitt.
- A: 4. Beispiel-Server beschreiben (Dell, Thomas Krenn) | L: z. B. 2-HE-Rackserver mit 2 Sockeln (Xeon/EPYC), 256 GB+ ECC-RDIMM, Hot-Swap-Laufwerksschächte (SAS/NVMe) mit Hardware-RAID-Controller und BBU, 2 redundante Hot-Swap-Netzteile, redundante Lüfter, Fernwartung (iDRAC/iLO/IPMI/Redfish), 10/25-GbE-NICs, TPM. Besonderheiten: Ausfallsicherheit, Wartung im laufenden Betrieb, 24/7-Betrieb.
- A: 5. Multi-Core (Desktop) vs. Multi-CPU (Server) | L: Multi-Core: mehrere Rechenkerne auf einem Chip/Sockel, teilen sich Cache und Speichercontroller – günstig, sparsam. Multi-CPU: mehrere physische Prozessoren in eigenen Sockeln, jeweils eigener Speichercontroller (NUMA), verbunden über Interconnect (UPI/Infinity Fabric) – mehr Kerne, RAM und PCIe-Lanes insgesamt, aber teurer und Software muss NUMA berücksichtigen; Lizenzierung oft pro Kern/Sockel.
- A: 6. Standard-Kühlmethoden bei Desktops und Servern und warum | L: Desktop: Luftkühlung mit großen Kühlkörpern und langsamen Lüftern bzw. AiO-Wasserkühlung – Fokus Lautstärke. Server: Front-to-Back-Luftstrom mit vielen kleinen, schnell drehenden, redundanten Hot-Swap-Lüftern und passiven Kühlkörpern; im Rechenzentrum Klimatisierung mit Kalt-/Warmgang, zunehmend Flüssigkühlung – Fokus Ausfallsicherheit, Dichte und 24/7-Betrieb, Lautstärke egal.
- A: 7. Warum sind Komponenten im Desktop so angeordnet (Temperaturmanagement)? | L: Wärme steigt auf, daher Frischluft vorne/unten, Abluft hinten/oben. Netzteil unten mit eigenem Luftweg, damit es nicht die CPU-Abwärme ansaugt. CPU oben nahe Heck-/Deckellüfter, Grafikkarte im unteren Bereich mit Frontluft, Laufwerkskäfig vorne im Luftstrom, Kabel hinter dem Mainboardtray für ungestörten Luftstrom.
- A: 8. Zwei Midi- und zwei Big-Tower vergleichen | L: Beispielhaft: Midi-Tower ca. 45 × 21 × 47 cm (H × B × T), 2–3 × 3,5″ und 2 × 2,5″, ATX-Mainboard, bis 360-mm-Radiator. Big-Tower ca. 55–65 cm hoch, E-ATX/XL-ATX, 6–10 × 3,5″, mehr Lüfter-/Radiatorplätze. Big-Tower: mehr Platz und Laufwerke, Midi: kompakter und günstiger. Werte vom gewählten Hersteller übernehmen.
- A: 9. Warum spielen optische Laufwerke kaum noch eine Rolle? | L: Software, Treiber und Betriebssysteme werden heruntergeladen oder per USB-Stick installiert; Musik/Filme kommen per Streaming; Datensicherung über NAS/Cloud/USB-Festplatten; Gehäuse ohne 5,25″-Schächte, Notebooks zu dünn; bei Bedarf externe USB-Laufwerke.
- A: 10. Thin Client (z. B. IGEL) technisch beschreiben | L: Beispiel IGEL UD3: lüfterlos, Low-Power-x86-CPU (z. B. AMD Ryzen Embedded), 4–8 GB RAM, 8–16 GB Flash, 2–3 Monitoranschlüsse (DP), USB, Gigabit-LAN, optional WLAN; IGEL OS (Linux-basiert), zentral über UMS verwaltet; unterstützt RDP/AVD, Citrix, VMware/Omnissa Horizon; sehr geringer Verbrauch (ca. 5–15 W), lange Lebensdauer, geringe Angriffsfläche.

## Karteikarten
- F: Was zeichnet einen Thin Client aus? | A: Wenig lokale Rechenleistung, Arbeit läuft auf Terminal-/VDI-Server, zentral verwaltet, sparsam
- F: Was ist ein HTPC? | A: Home Theater PC – leiser Multimedia-PC fürs Wohnzimmer
- F: Woran erkennt man einen Green-PC? | A: Niedrige TDP, effizientes Netzteil, SSD, Energiesparmodi, Umweltsiegel
- F: Unterschied Multi-Core und Multi-CPU? | A: Multi-Core = mehrere Kerne in einem Sockel; Multi-CPU = mehrere physische Prozessoren in mehreren Sockeln
- F: Was bedeutet NUMA? | A: Non-Uniform Memory Access – jeder Prozessor hat eigenen lokalen Speicher, Zugriff auf fremden ist langsamer
- F: Typischer Luftstrom im Server? | A: Front-to-Back (vorne kalt rein, hinten warm raus)
- F: Wie berechnet man Stromkosten? | A: Leistung in kW × Betriebsstunden × Preis pro kWh
- F: Warum Netzteil unten im Gehäuse? | A: Eigener Luftweg, saugt keine CPU-Abwärme an, tiefer Schwerpunkt

## Quiz
? Ein PC mit 35 W läuft 8 h an 220 Tagen bei 0,35 €/kWh. Kosten?
* 21,56 €
- 2,16 €
- 215,60 €
- 61,60 €

? Was ist ein typisches Merkmal von Multi-CPU-Servern?
* Mehrere Sockel mit eigenem Speichercontroller (NUMA)
- Nur ein Kern pro System
- Keine ECC-Unterstützung
- Passivkühlung ohne Lüfter

? Wie verläuft der Luftstrom im typischen Desktop?
* Vorne/unten rein, hinten/oben raus
- Oben rein, unten raus
- Hinten rein, vorne raus
- Nur seitlich

? Welches Gerät benötigt zwingend einen Server, um sinnvoll zu arbeiten?
* Thin Client
- HTPC
- Gaming-PC
- Green-PC

? Warum sind Serverlüfter redundant und hot-swap-fähig?
* Damit der 24/7-Betrieb bei Lüftertausch weiterläuft
- Damit sie leiser sind
- Weil Server keine Kühlkörper haben
- Weil sie Strom sparen

? Welche Fernwartungsschnittstelle ist typisch für Server?
* iDRAC/iLO bzw. IPMI
- HDMI-CEC
- Bluetooth
- S/PDIF

? Welcher Grund erklärt, warum optische Laufwerke kaum noch verbaut werden?
* Installationen und Medien kommen per Download, USB und Streaming
- Sie sind verboten
- USB ist langsamer als DVD
- Betriebssysteme können keine DVDs lesen

? Welches Siegel kennzeichnet energieeffiziente Netzteile?
* 80 PLUS
- CE
- IP67
- RoHS

## Spickzettel
- Desktop, Thin Client (Server nötig), HTPC (leise, Multimedia), Green-PC (sparsam), Server (redundant)
- Multi-Core = 1 Sockel, Multi-CPU = mehrere Sockel/NUMA
- Kühlung Desktop leise, Server Front-to-Back redundant
- Luft vorne/unten rein, hinten/oben raus
- Kosten = kW × h × €/kWh
