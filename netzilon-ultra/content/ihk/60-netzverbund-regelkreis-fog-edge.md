---
id: ihk-netzverbund-regelkreis-edge
bereich: AP1
block: IHK
kapitel: Zwischenprüfung-Ergänzungen
titel: Verbundarten, Regelkreis (IoT) sowie Cloud, Fog und Edge Computing
stufe: Fortgeschritten
fach: ITK / Grundlagen
pruefungen: [AP1, Schule]
quellen: [320158769_zusammenfassung-Zwischenprfung-2022.pdf, Lernzettel_AP1AP2_2024.pdf]
verweise: [ihk-lz-voip-iot, ihk-vor-nachteile, ihk-fachbegriffe-technik]
---

## Profi

### Gründe für Netzwerke und Verbundarten
Rechner werden vernetzt, um Kommunikation, Datensicherung, Verfügbarkeit, Wartbarkeit und Kosten zu optimieren. Die klassische Einteilung nach dem **Nutzen** des Verbunds:
| Verbund | Zweck | Beispiel |
|---|---|---|
| **Datenverbund** | gemeinsamer, strukturierter Zugriff auf zentrale Datenbestände | Fileserver, Datenbank, ERP |
| **Funktionsverbund** | gemeinsame Nutzung von Ressourcen und Spezialfunktionen, senkt Kosten | Netzwerkdrucker, Scanner |
| **Verfügbarkeitsverbund** | Ausfallsicherheit: fällt ein Rechner aus, übernimmt ein anderer | Cluster, Ersatz-PC im Netz |
| **Lastverbund** | schwach ausgelastete Rechner entlasten stark ausgelastete | Load-Balancing, Renderfarm |

Unterscheidungsmerkmale von Netzen: Topologie (Stern, Bus, Ring), räumliche Ausdehnung (PAN, LAN, MAN, WAN), Protokolle (Ethernet), offen/geschlossen (Sicherheit), Übertragungsmedium (WLAN/Kabel), Architektur (Peer-to-Peer / Client-Server) und Zugriffsverfahren (CSMA/CD, Token Ring).

### Sensoren, Aktoren, Controller und Regelkreis (IoT)
- **Sensor**: erfasst eine physikalische Größe (Helligkeit, Druck, Bewegung, Temperatur).
- **Aktor**: wandelt ein elektrisches Signal in eine physische Aktion (hydraulisch, pneumatisch, elektrisch), z. B. Motor, Ventil, Lampe.
- **Controller**: empfängt Sensordaten, entscheidet und steuert den Aktor (Arduino, Raspberry Pi, SPS).
- **Offene Steuerung**: ohne Rückkopplung (Licht an/aus per Schalter).
- **Geschlossene Regelung (Regelkreis)**: Der Sensor meldet den Istwert zurück, der Controller vergleicht mit dem Sollwert (Heizung hält 21 °C; je dunkler es draußen wird, desto heller das Licht).
- Smarte Produkte liefern Feedback von jeder Produktionsebene bis zum Kunden: optimale Auslastung, schnelle Änderungen, Fehlererkennung während der Produktion, laufende Qualitätskontrolle.
- Anwendungsbereiche: Gebäudeautomation (Licht, Temperatur, Energie), Landwirtschaft (Drohnen, Sensoren), Gesundheitswesen (Telemedizin, Patientenüberwachung).

### Cloud, Fog und Edge Computing
- **Cloud Computing**: Ressourcen (Server, Speicher, Anwendungen) bei Bedarf über das Internet, geräteunabhängig, mit Abrechnung nach Nutzung.
- **Edge Computing**: Verarbeitung dezentral am Rand des Netzes, dort wo die Daten entstehen (Erfassung, Aggregation, Analyse). Vorteile: geringe Latenz, weniger Bandbreite, Datenschutz.
- **Fog Computing**: Zwischenschicht zwischen Edge-Geräten und Cloud. Ein erheblicher Teil von Berechnung, Speicherung und Kommunikation läuft lokal, nur das Nötige geht über das Internet-Backbone in die Cloud.

## Einfach

Stell dir eine Klasse vor. **Datenverbund**: Alle holen sich die Hausaufgaben aus demselben Ordner. **Funktionsverbund**: Es gibt nur einen Drucker, alle dürfen ihn nutzen, das spart Geld. **Verfügbarkeitsverbund**: Wenn dein Laptop kaputtgeht, setzt du dich an einen anderen. **Lastverbund**: Wer fertig ist, hilft dem, der noch viel zu tun hat.

Ein Heizungsthermostat ist ein **Regelkreis**: Der Fühler (Sensor) misst, die Steuerung (Controller) vergleicht mit dem Wunsch, das Heizventil (Aktor) dreht auf oder zu. Weil der Fühler immer wieder meldet, wie warm es geworden ist, ist der Kreis geschlossen. Ein einfacher Lichtschalter fragt nie nach, ob es hell genug ist: das ist nur eine Steuerung.

**Cloud** ist das große Rechenzentrum weit weg. **Edge** ist der kleine Rechner direkt neben der Maschine. **Fog** ist der Raum dazwischen: ein Rechner im Gebäude, der vorsortiert, bevor etwas in die Cloud geschickt wird.

## Merksatz
- DFVL: Daten, Funktion, Verfügbarkeit, Last.
- Sensor sieht, Controller denkt, Aktor handelt.
- Mit Rückkopplung = Regelung, ohne = Steuerung.
- Edge am Rand, Fog im Nebel dazwischen, Cloud ganz oben.

## Prüfungsfalle
- Steuerung (offen) und Regelung (geschlossen) verwechseln.
- Fog und Edge gleichsetzen: Edge rechnet am Gerät, Fog in einer Zwischenschicht.
- Funktionsverbund (Ressourcen teilen) mit Lastverbund (Rechenlast verteilen) verwechseln.
- Aktor und Sensor vertauschen.

## Grafik
### Regelkreis Heizung
1. Sensor -> Controller: Ist-Temperatur 18 °C
2. Controller: vergleicht mit Soll 21 °C
3. Controller -> Aktor: Ventil öffnen
4. Aktor: Heizkörper wird warm
5. Sensor -> Controller: neue Ist-Temperatur (Rückkopplung)

### Edge, Fog, Cloud
1. Sensor -> Edge: Rohdaten
2. Edge -> Fog: vorverarbeitete Daten
3. Fog -> Cloud: aggregierte Daten zur Langzeitanalyse
4. Cloud -> Fog: Modell-Update

## Übungen
- A: Ein Netzwerkdrucker wird von 20 PCs genutzt. Welcher Verbund? | L: Funktionsverbund (gemeinsame Ressource, Kostensenkung)
- A: Eine Raumtemperatur wird automatisch auf 21 °C gehalten. Steuerung oder Regelung? | L: Regelung, weil der Istwert zurückgemeldet wird

## Lücken
- Ein {Sensor} erfasst physikalische Größen, ein {Aktor} führt eine Aktion aus.
- Beim {Edge} Computing wird dort gerechnet, wo die Daten entstehen.
- Ohne Rückkopplung spricht man von einer offenen {Steuerung}.

## Zuordnen
### Verbundart zu Zweck
- Datenverbund => strukturierter Zugriff auf zentrale Daten
- Funktionsverbund => Ressourcen teilen, Kosten sparen
- Verfügbarkeitsverbund => Ausfallsicherheit
- Lastverbund => Lastausgleich zwischen Rechnern

## Spickzettel
- DFVL: Daten, Funktion, Verfügbarkeit, Last
- Sensor misst, Controller entscheidet, Aktor handelt
- Regelung = mit Rückkopplung, Steuerung = ohne
- Edge = am Datenursprung, Fog = Zwischenschicht, Cloud = zentral

## Karteikarten
- F: Was ist ein Datenverbund? | A: Gemeinsamer, strukturierter Zugriff auf zentrale Datenbestände
- F: Was ist ein Funktionsverbund? | A: Gemeinsame Nutzung von Ressourcen wie Druckern, senkt Kosten
- F: Was ist ein Verfügbarkeitsverbund? | A: Verbund zur Ausfallsicherheit: ein anderer Rechner übernimmt
- F: Was ist ein Lastverbund? | A: Schwach ausgelastete Rechner helfen stark ausgelasteten
- F: Was macht ein Sensor? | A: Erfasst eine physikalische Größe wie Temperatur, Druck oder Helligkeit
- F: Was macht ein Aktor? | A: Wandelt ein elektrisches Signal in eine physische Aktion um
- F: Was unterscheidet Steuerung und Regelung? | A: Regelung hat Rückkopplung (geschlossener Kreis), Steuerung nicht (offen)
- F: Was ist Edge Computing? | A: Datenverarbeitung dezentral am Rand des Netzes, dort wo die Daten entstehen
- F: Was ist Fog Computing? | A: Zwischenschicht, die Berechnung, Speicherung und Kommunikation lokal übernimmt, bevor Daten in die Cloud gehen
- F: Nenne einen Vorteil von Edge Computing | A: Geringe Latenz und weniger Datenverkehr zur Cloud

## Quiz
? Ein Netzwerkdrucker wird von allen Mitarbeitern genutzt. Welcher Verbund liegt vor?
* Funktionsverbund
- Datenverbund
- Lastverbund
- Verfügbarkeitsverbund
! Gemeinsame Ressource, Kostensenkung.

? Bei Ausfall eines PCs arbeitet man an einem anderen im Netz weiter. Welcher Verbund?
* Verfügbarkeitsverbund
- Datenverbund
- Funktionsverbund
- Lastverbund

? Welche Aufgabe hat ein Aktor?
* Er setzt ein Steuersignal in eine physische Aktion um
- Er misst Temperaturen
- Er speichert Daten in der Cloud
- Er vergibt IP-Adressen

? Was kennzeichnet eine geschlossene Regelung?
* Der Istwert wird per Sensor zurückgemeldet
- Es gibt keinen Sensor
- Der Aktor entscheidet allein
- Es wird nur ein Schalter betätigt

? Ein Lichtschalter schaltet Licht ein und aus ohne Rückmeldung. Das ist …
* eine offene Steuerung
- eine Regelung
- Fog Computing
- ein Lastverbund

? Wo findet Edge Computing statt?
* Am Rand des Netzes, nahe der Datenquelle
- Ausschließlich im Rechenzentrum der Cloud
- Nur auf dem Router des Providers
- Im Backup-Archiv

? Was beschreibt Fog Computing am besten?
* Eine Zwischenschicht zwischen Edge-Geräten und Cloud, die Daten lokal vorverarbeitet
- Eine reine Speicherung auf Band
- Ein Verfahren zur Verschlüsselung
- Eine Netzwerktopologie

? Welche Rolle hat der Controller im IoT-Regelkreis?
* Er empfängt Sensordaten, entscheidet und steuert den Aktor
- Er misst die Größe selbst
- Er stellt nur Strom bereit
- Er ersetzt den Aktor

? Welcher Verbund beschreibt Load-Balancing?
* Lastverbund
- Datenverbund
- Funktionsverbund
- Verfügbarkeitsverbund
