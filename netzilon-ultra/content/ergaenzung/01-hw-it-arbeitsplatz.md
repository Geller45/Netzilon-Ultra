---
id: erg-it-arbeitsplatz
bereich: AP1
block: ERG
kapitel: Ergänzungen 2.2
titel: IT-Arbeitsplatz planen – Komponenten, Schnittstellen, Ergonomie und Inbetriebnahme
stufe: Einsteiger
fach: ITK / Grundlagen
pruefungen: [AP1, AP2]
quellen: [IHK-Prüfungskatalog FiSi (AP1, Gebiet „Einrichten eines IT-gestützten Arbeitsplatzes“), ArbStättV Anhang 6, DIN EN ISO 9241, Herstellerdatenblätter]
verweise: [ap1-a1-rechneraufbau, ap1-a1-mainboard, ap1-a1-arbeitsspeicher, ap1-a1-usb, ap1-a1-displays, ap1-a2-netzteil, wiso-arbeitsschutz]
---

## Profi

### Vom Kundenauftrag zum fertigen Arbeitsplatz
Die AP1 prüft das **Einrichten eines IT-gestützten Arbeitsplatzes** als komplette Handlung: Anforderungen aufnehmen, passende Hardware auswählen, Angebote vergleichen, Gerät in Betrieb nehmen, an das Netz anbinden, dokumentieren und den Benutzer einweisen.

1. **Anforderungsanalyse** – Welche Tätigkeit (Büro, CAD, Entwicklung, Kasse, Lager)? Welche Software mit welchen **Mindest- und empfohlenen Systemanforderungen**? Mobil oder stationär? Wie viele Bildschirme? Besondere Umgebung (Staub, Lärm, Hygiene)?
2. **Komponentenwahl** – CPU (Kerne, Takt, integrierte Grafik), **RAM** (Größe, Typ DDR4/DDR5, Dual-Channel), **Massenspeicher** (NVMe-SSD statt HDD für das System), **Grafik** (integriert vs. dediziert für CAD/Video), **Netzwerk** (Gigabit-LAN, WLAN 6/6E/7), **Schnittstellen** (USB-C mit DisplayPort Alt Mode, Thunderbolt, HDMI, DisplayPort), **TPM 2.0** und UEFI Secure Boot (Pflicht für Windows 11).
3. **Peripherie** – Monitor (Größe, Auflösung, Panel IPS/VA/TN, Ergonomie: höhenverstellbar, neigbar, entspiegelt), Tastatur/Maus, Headset für Telefonie (Softphone), Docking-Station für Notebooks, ggf. Drucker/Scanner im Netz.
4. **Rahmenbedingungen** – Budget, **TCO** (Anschaffung + Betrieb + Entsorgung), Energieeffizienz (Energy Star, EPEAT, Blauer Engel/TCO Certified), Garantie und **Vor-Ort-Service**, Lieferzeit, Kompatibilität mit vorhandener Infrastruktur.

### Schnittstellen sicher zuordnen
| Schnittstelle | Typische Nutzung | Merkmal |
|---|---|---|
| USB 3.2 Gen 1 / Gen 2 | Speicher, Peripherie | 5 bzw. 10 Gbit/s |
| USB4 / Thunderbolt 4 | Dock, Monitore, externe SSD | 40 Gbit/s, USB-C-Stecker, Power Delivery |
| HDMI 2.1 | Monitor, Beamer, TV | bis 48 Gbit/s, mit Audio |
| DisplayPort 1.4/2.x | Monitore, Daisy-Chain (MST) | im Büro Standard für Mehrschirm |
| RJ45 (Gigabit-Ethernet) | kabelgebundenes LAN | Cat 6/6A, PoE möglich |

Achtung: **USB-C ist nur die Steckerform**. Welche Funktionen (Datenrate, Bildsignal, Ladeleistung) dahinterstecken, steht im Datenblatt.

### Ergonomie und Arbeitsschutz
Bildschirmarbeitsplätze regelt die **Arbeitsstättenverordnung (ArbStättV) Anhang 6**: Bildschirm frei dreh- und neigbar, reflexionsarm, Zeichen scharf; Tastatur getrennt vom Bildschirm; ausreichend Platz; Blickrichtung **parallel zum Fenster**; Oberkante des Bildschirms etwa auf Augenhöhe; Sehabstand etwa 50–80 cm. Normen der Reihe **DIN EN ISO 9241** beschreiben Ergonomie von Hardware und Software. Der Arbeitgeber muss eine **Gefährdungsbeurteilung** durchführen und regelmäßige Augenuntersuchungen anbieten.

### Inbetriebnahme und Übergabe
Auspacken und Sichtprüfung → Aufbau und Verkabelung (Kabelmanagement, Stolperfallen vermeiden) → UEFI-Einstellungen prüfen (Secure Boot, TPM, Bootreihenfolge, UEFI-Kennwort) → Betriebssystem ausrollen (Image oder Autopilot) → Treiber und Updates → Domänen- bzw. Entra-Beitritt → Software verteilen → Funktionstest (Netz, Drucker, Anmeldung, Mail) → **Inventarisierung** (Seriennummer, Inventarnummer, Standort) → **Übergabeprotokoll** mit Unterschrift und Einweisung des Benutzers.

## Einfach
Stell dir vor, ein neuer Kollege fängt am Montag an und braucht einen Computerplatz. Du bist der Profi, der alles vorbereitet.

Zuerst fragst du: **Was macht der Kollege?** Wer nur E-Mails schreibt, braucht keinen teuren Gaming-PC. Wer Pläne zeichnet (CAD), braucht dagegen eine starke Grafikkarte und viel Arbeitsspeicher. Das ist wie beim Schuhkauf: Für den Wald nimmst du Wanderschuhe, fürs Büro Halbschuhe.

Dann suchst du die **Teile** aus: einen schnellen Prozessor (das Gehirn), genug Arbeitsspeicher (der Schreibtisch, auf dem gerade gearbeitet wird), eine SSD (der superschnelle Schrank für Dateien) und die passenden **Anschlüsse**, damit Bildschirm, Maus und Headset passen.

Danach kommt der **Bildschirm**. Er soll sich verstellen lassen, nicht spiegeln und so stehen, dass das Fenster seitlich ist – sonst blendet die Sonne. Der Kollege soll gerade sitzen und nicht nach oben oder unten gucken müssen. Das schreibt sogar ein Gesetz vor, damit niemand Rückenschmerzen oder müde Augen bekommt.

Zum Schluss **baust du alles auf**, installierst Windows und die Programme, testest, ob Drucker, Internet und E-Mail klappen, schreibst die Seriennummer in eine Liste und lässt dir auf einem **Übergabeprotokoll** unterschreiben, dass alles funktioniert. Dann erklärst du dem Kollegen kurz, wie alles geht. Fertig ist der Arbeitsplatz!

Ein guter Tipp: Denke nicht nur an den Preis beim Kauf. Ein billiger PC, der viel Strom frisst oder oft kaputt geht, kostet am Ende mehr. Das nennt man **Gesamtkosten (TCO)**.

## Merksatz
- **Erst fragen, dann kaufen**: Anforderungen → Komponenten → Angebot → Inbetriebnahme → Übergabe.
- **USB-C ist ein Stecker, kein Standard** – Datenblatt lesen.
- **Fenster seitlich, Bildschirmoberkante auf Augenhöhe, 50–80 cm Abstand.**
- **Windows 11 braucht TPM 2.0 und UEFI mit Secure Boot.**
- **Ohne Übergabeprotokoll keine Abnahme.**

## Prüfungsfalle
- „Mehr GHz = schneller“ stimmt nicht pauschal – Kernzahl, Architektur und Cache zählen mit.
- **Mindestanforderungen** einer Software sind nicht die **Empfehlung** für flüssiges Arbeiten.
- Ein **USB-C**-Anschluss liefert nicht automatisch Bildsignal oder Thunderbolt.
- Bildschirm **vor** dem Fenster oder mit dem Rücken zum Fenster ist ergonomisch falsch (Blendung/Spiegelung).
- Bei der Kostenbetrachtung nicht nur den Kaufpreis, sondern die **TCO** nennen.

## Grafik
### Inbetriebnahme eines Arbeitsplatzes
1. Kunde -> Techniker: Anforderungen (Tätigkeit, Software, Budget)
2. Techniker: Komponenten auswählen und Angebote vergleichen
3. Lieferant -> Techniker: Hardware wird geliefert
4. Techniker: Aufbau, UEFI prüfen, Image ausrollen
5. Techniker -> Domäne: Gerät tritt der Domäne bei
6. Techniker: Funktionstest und Inventarisierung
7. Techniker -> Kunde: Übergabeprotokoll und Einweisung

## Lab
**Maschinen**: neuer Client **CL05** (Windows 11 Pro) im Heimlabor **example.com**, Domänencontroller **DC01**.

### GUI
1. **CL05**: Einstellungen → System → Info → Gerätename, Prozessor, RAM notieren.
2. **CL05**: `tpm.msc` öffnen → Status „Das TPM ist einsatzbereit“, Spezifikationsversion 2.0 prüfen.
3. **CL05**: `msinfo32` → Systemübersicht → „BIOS-Modus: UEFI“ und „Sicherer Startzustand: Ein“ prüfen.
4. **CL05**: Einstellungen → System → Info → „Domäne oder Arbeitsgruppe“ → Domäne **example.com** beitreten → Neustart.
5. **CL05**: Inventardaten (Seriennummer, MAC-Adresse) in die Inventarliste übertragen.

### PowerShell
```powershell
# Auf CL05 als Administrator
Get-ComputerInfo -Property CsName, CsProcessors, CsTotalPhysicalMemory, BiosSerialNumber
Get-Tpm | Select-Object TpmPresent, TpmReady, ManufacturerVersion
Confirm-SecureBootUEFI
Get-NetAdapter | Select-Object Name, MacAddress, LinkSpeed
Add-Computer -DomainName example.com -Restart
```

## Legende
### Anforderungsanalyse
- Was: Systematisches Erfassen, wofür der Arbeitsplatz genutzt wird und welche Software, Leistung und Peripherie nötig sind.
- Wie: Gespräch mit Kunde/Fachabteilung, Checkliste, Systemanforderungen der Software prüfen.
- Wann: Vor jeder Beschaffung, also ganz am Anfang des Auftrags.
- Wo: Im Kundengespräch bzw. im Lastenheft.
- Warum: Verhindert Fehlkäufe (zu schwach oder überdimensioniert) und begründet die Auswahl.

### Übergabeprotokoll
- Was: Dokument, das die Übergabe eines funktionsfähigen Arbeitsplatzes bestätigt.
- Wie: Geräte mit Seriennummern, durchgeführte Tests und Einweisung auflisten, beide Seiten unterschreiben.
- Wann: Nach Aufbau und erfolgreichem Funktionstest.
- Wo: Beim Benutzer am Arbeitsplatz, Ablage im Ticket/Inventarsystem.
- Warum: Nachweis der Leistungserbringung, Grundlage für Abnahme und Gewährleistung.

## Karteikarten
- F: Nennen Sie vier Fragen einer Anforderungsanalyse für einen neuen Arbeitsplatz. | A: Tätigkeit/Einsatzzweck, benötigte Software und deren Systemanforderungen, Mobilität (Notebook/Desktop), Anzahl Bildschirme/Peripherie, Budget, Umgebungsbedingungen.
- F: Welche Hardware-Voraussetzungen stellt Windows 11 an die Plattform? | A: 64-Bit-CPU (kompatibel), mind. 4 GB RAM, 64 GB Speicher, UEFI mit Secure Boot und TPM 2.0.
- F: Warum sollte das Systemlaufwerk eine NVMe-SSD sein? | A: Deutlich kürzere Zugriffszeiten und höhere Datenraten als HDD – schneller Start und Programmstart, keine Mechanik.
- F: Was bedeutet „USB-C ist nur ein Stecker“? | A: Die Steckerform sagt nichts über Datenrate, Bildübertragung (DP Alt Mode) oder Ladeleistung (Power Delivery) aus.
- F: Welche Verordnung regelt Bildschirmarbeitsplätze? | A: Die Arbeitsstättenverordnung (ArbStättV), Anhang 6.
- F: Wie soll ein Bildschirm zum Fenster stehen? | A: Blickrichtung parallel zum Fenster, also Fenster seitlich – keine Blendung, keine Spiegelung.
- F: Was gehört in ein Übergabeprotokoll? | A: Geräte mit Serien-/Inventarnummer, durchgeführte Tests, installierte Software, Einweisung, Datum, Unterschriften.
- F: Was ist TCO? | A: Total Cost of Ownership – alle Kosten über die Nutzungsdauer: Anschaffung, Betrieb (Strom, Wartung, Support) und Entsorgung.
- F: Welche Schnittstelle eignet sich für eine Docking-Station mit zwei Monitoren am Notebook? | A: Thunderbolt 4 bzw. USB4 (USB-C) mit DisplayPort Alt Mode und Power Delivery.
- F: Nennen Sie zwei Umweltzeichen für IT-Geräte. | A: Energy Star, Blauer Engel, TCO Certified, EPEAT.

## Quiz
? Welche Schnittstelle überträgt laut Spezifikation bis zu 40 Gbit/s über einen USB-C-Stecker?
* Thunderbolt 4 / USB4
- USB 2.0
- USB 3.2 Gen 1
- VGA
! Thunderbolt 4 und USB4 nutzen USB-C und erreichen 40 Gbit/s; USB 3.2 Gen 1 schafft 5 Gbit/s.

? Welche Komponente ist für Windows 11 zwingend erforderlich?
* TPM 2.0
- Dedizierte Grafikkarte
- 16 GB RAM
- Optisches Laufwerk
! Windows 11 verlangt TPM 2.0 und UEFI mit Secure Boot; 4 GB RAM sind Minimum.

? Wie sollte ein Bildschirmarbeitsplatz zum Fenster ausgerichtet sein?
* Blickrichtung parallel zur Fensterfront
- Mit dem Gesicht zum Fenster
- Mit dem Rücken zum Fenster
- Egal, Hauptsache hell
! So entstehen weder Blendung (Blick ins Fenster) noch Spiegelungen (Fenster im Rücken).

? Was ist der erste Schritt beim Einrichten eines neuen IT-Arbeitsplatzes?
* Anforderungsanalyse
- Image ausrollen
- Hardware bestellen
- Übergabeprotokoll unterschreiben
! Ohne Kenntnis der Anforderungen kann keine passende Hardware ausgewählt werden.

? Welche Aussage zu USB-C ist richtig?
* USB-C bezeichnet nur die Steckerform; die Funktionen hängen vom Standard dahinter ab.
- USB-C liefert immer 40 Gbit/s.
- USB-C überträgt immer ein Bildsignal.
- USB-C ist dasselbe wie USB 3.0.
! Datenrate, DisplayPort Alt Mode und Power Delivery sind optional und stehen im Datenblatt.

? Welcher Sehabstand zum Bildschirm wird für Büroarbeit typischerweise empfohlen?
* etwa 50 bis 80 cm
- etwa 10 bis 20 cm
- etwa 1,5 bis 2 m
- genau 30 cm
! Der Abstand hängt von Bildschirmgröße und Auflösung ab, liegt aber meist bei 50–80 cm.

? Welche Kosten umfasst die TCO eines Arbeitsplatzes?
* Anschaffung, Betrieb, Wartung, Support und Entsorgung
- Nur den Kaufpreis
- Nur die Stromkosten
- Nur die Lizenzkosten
! TCO = Total Cost of Ownership über die gesamte Nutzungsdauer.

? Wozu dient das Übergabeprotokoll?
* Nachweis der vertragsgemäßen Übergabe und Grundlage der Abnahme
- Es ersetzt die Rechnung.
- Es ist die Garantiekarte des Herstellers.
- Es dient nur der Inventur des Lieferanten.
! Mit der Unterschrift bestätigt der Kunde die Funktionsfähigkeit; ab dann laufen z. B. Gewährleistungsfristen.

? Welche Speicherart sollte für das Betriebssystem eines neuen Büro-PCs gewählt werden?
* NVMe-SSD
- HDD mit 5.400 U/min
- USB-Stick
- Bandlaufwerk
! NVMe-SSDs sind über PCIe angebunden und bieten die kürzesten Zugriffszeiten.

## Lücken
- Windows 11 setzt {TPM 2.0} und UEFI mit {Secure Boot} voraus.
- Bildschirmarbeitsplätze regelt die {Arbeitsstättenverordnung|ArbStättV} im Anhang 6.
- Die Gesamtkosten über die Nutzungsdauer heißen {TCO|Total Cost of Ownership}.
- Mit dem {Übergabeprotokoll} bestätigt der Benutzer den funktionsfähigen Arbeitsplatz.

## Zuordnen
### Schnittstelle und typische Nutzung
- DisplayPort => Monitor-Anschluss, Daisy-Chain per MST
- RJ45 => kabelgebundenes Ethernet
- Thunderbolt 4 => Docking-Station mit Bild, Daten und Strom
- HDMI => Beamer oder TV mit Audio

### Anforderung und Komponente
- CAD-Konstruktion => dedizierte Grafikkarte, viel RAM
- Büroarbeit mit Office => integrierte Grafik, 16 GB RAM, NVMe-SSD
- Außendienst => Notebook mit LTE/5G und langer Akkulaufzeit
- Kassenarbeitsplatz => robuster Kompakt-PC mit Bondrucker

### Ergonomie-Regel und Ziel
- Fenster seitlich => keine Blendung und Spiegelung
- Bildschirm höhenverstellbar => aufrechte Kopfhaltung
- Tastatur getrennt vom Bildschirm => freie Arbeitshaltung
- Reflexionsarme Oberfläche => weniger Augenbelastung

## Reihenfolge
### Arbeitsplatz einrichten
1. Anforderungen aufnehmen
2. Komponenten auswählen und Angebote vergleichen
3. Hardware aufbauen und verkabeln
4. Betriebssystem und Treiber installieren
5. Gerät in die Domäne aufnehmen und Software verteilen
6. Funktionstest durchführen
7. Inventarisieren und Übergabeprotokoll unterschreiben lassen

### UEFI-Prüfung vor der Windows-11-Installation
1. UEFI-Setup beim Start aufrufen
2. Bootmodus UEFI (ohne CSM) prüfen
3. TPM 2.0 aktivieren
4. Secure Boot einschalten
5. Bootreihenfolge auf Netzwerk/USB-Installationsmedium setzen

### Defekten Arbeitsplatz-PC tauschen
1. Störung im Ticket aufnehmen
2. Daten des Benutzers sichern bzw. Speicherort prüfen
3. Ersatzgerät vorbereiten
4. Gerät tauschen und anschließen
5. Funktion mit dem Benutzer testen
6. Altgerät inventarisieren und Ticket schließen

## Freitext
- F: Ein Architekturbüro benötigt einen CAD-Arbeitsplatz. Nennen und begründen Sie drei Hardware-Anforderungen. | M: Dedizierte Grafikkarte mit zertifizierten Treibern (3D-Darstellung), mindestens 32 GB RAM (große Modelle), schnelle NVMe-SSD (Ladezeiten), großer Monitor mit hoher Auflösung bzw. zwei Monitore (Übersicht). | P: 6
- F: Erläutern Sie zwei Anforderungen der ArbStättV an einen Bildschirmarbeitsplatz. | M: Bildschirm frei dreh- und neigbar, reflexionsarm, scharfe Darstellung; Tastatur vom Bildschirm getrennt; ausreichend Bewegungsfläche; Anordnung blendfrei (Fenster seitlich). | P: 4
- F: Begründen Sie, warum bei der Beschaffung nicht nur der Kaufpreis, sondern die TCO betrachtet werden sollte. | M: Betriebskosten (Strom, Wartung, Support, Ausfallzeiten) und Entsorgung können über die Nutzungsdauer höher sein als der Kaufpreis; ein günstiges Gerät kann insgesamt teurer werden. | P: 3

## Szenario
### Neuer Kollege im Vertrieb
Die Muster GmbH stellt einen Vertriebsmitarbeiter ein, der viel beim Kunden unterwegs ist, im Büro aber an zwei Monitoren arbeitet. Er nutzt Office, CRM im Browser und Softphone.
- F: Welches Endgerät schlagen Sie vor? | A: Business-Notebook mit Windows 11 Pro, 16 GB RAM, NVMe-SSD, LTE/5G optional, lange Akkulaufzeit. | P: 2
- F: Wie binden Sie die zwei Monitore im Büro an? | A: Über eine Thunderbolt-/USB4-Docking-Station mit zwei DisplayPort-/HDMI-Ausgängen, Strom über Power Delivery. | P: 2
- F: Welches Zubehör benötigt er für das Softphone? | A: Ein Headset (USB oder Bluetooth) mit Mikrofon, möglichst mit Geräuschunterdrückung. | P: 1

### Windows-11-Rollout scheitert
Beim Rollout auf zehn ältere PCs meldet das Setup „Dieser PC erfüllt nicht die Systemanforderungen“.
- F: Welche zwei Plattformmerkmale prüfen Sie zuerst? | A: TPM 2.0 (tpm.msc) und UEFI-Modus mit Secure Boot (msinfo32). | P: 2
- F: Was tun Sie, wenn die CPU nicht unterstützt wird? | A: Gerät nicht mit Tricks umgehen, sondern Ersatzbeschaffung planen bzw. Gerät mit unterstütztem Betriebssystem weiterbetreiben, solange es Updates gibt. | P: 2

### Beschwerde über Augenschmerzen
Eine Mitarbeiterin klagt über Kopfschmerzen; ihr Monitor steht direkt vor dem Fenster.
- F: Was ist die Ursache? | A: Blendung durch Gegenlicht – sie blickt ins Fenster. | P: 1
- F: Welche Maßnahmen schlagen Sie vor? | A: Arbeitsplatz drehen (Fenster seitlich), Blendschutz/Jalousie, Bildschirmhöhe und -abstand anpassen, Augenuntersuchung anbieten. | P: 3
