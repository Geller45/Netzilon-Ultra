---
id: ihk-ap1-ip-kameras
bereich: AP1
block: IHK
kapitel: AP1 Musterklausur
titel: AP1-Übungsklausur Werksgelände mit IP-Kameras (Lösungsblatt mit Rechenwegen)
stufe: Fortgeschritten
fach: PV – AP1
pruefungen: [AP1]
quellen: [9268228a-7f84578330db493abe463bb8634a0d7c_1.pdf]
verweise: [ihk-berechnungen-lernzettel, ihk-netzplan, ihk-lz-sicherheit, ihk-lz-vlan-wlan-ipv6, ihk-kalkulation, wiso-kaufvertrag]
---

## Profi

Die Quelle ist ein **Lösungsblatt** (nur Antworten, die Aufgabenstellungen fehlen im PDF). Die Fragen sind unten aus den Lösungen rekonstruiert und als solche gekennzeichnet. Das Szenario: ein Werksgelände mit IP-Überwachungskameras, Kennzeichenerkennung an der Schranke, Arbeitsplätzen mit mehreren Monitoren und einem Softwareprojekt (Versandkostenrechner).

### PoE-Kamera
- Standard: **IEEE 802.3at** (PoE+, bis 30 W am Switchport). Stromstärke: `I = P / U = 24 W / 48 V = 0,5 A = 500 mA`.
- Sicherheitsfunktion „individuelles Passwort bei Erstinstallation erzwingen": keine automatisierten Angriffe über Standardlogins wie admin/admin.
- **IR** (Infrarot) = Aufnahmen bei völliger Dunkelheit, **Heater** = Heizung gegen Beschlagen und Einfrieren der Linse im Außeneinsatz.

### Datenrate und Speicherbedarf
Datenrate eines Streams: `1920 * 1080 * 30 fps * 24 Bit * 0,30 (Kompression) = 447.897.600 Bit/s ≈ 448 Mbit/s`.
Speicher für 4 Kameras über 72 Stunden: `(448 Mbit/s * 4 * 72 h * 3600 s) / (8 * 1024^4) ≈ 53 TiB` (aufgerundet). Merke: durch 8 für Byte, dann durch 1024^4 für TiB.

### Subnetting
192.168.16.0 mit Maske 255.255.255.128 (/25): 126 nutzbare Hosts (2^7 - 2), Netzadresse 192.168.16.0, Broadcast 192.168.16.127.

### Fehlersuche im Netz (Symptom, Ursache, Maßnahme)
| Prüfung | Maßnahme |
|---|---|
| Kabel defekt | gegen geprüftes Kabel tauschen, defektes ersetzen |
| IP-Konfiguration falsch | per `ipconfig` mit Gateway abgleichen, IP korrigieren oder auf DHCP stellen |
| Link-LED aus | Patchpanel-Verbindung zum Switch herstellen |
| Namensauflösung fehlerhaft | `nslookup` oder `ping` auf IP und Hostnamen vergleichen, korrekten DNS-Server eintragen |

### IPv4 gegenüber IPv6
IPv4: 32 Bit (ca. 4,3 Milliarden Adressen), dezimale Punktnotation. IPv6: 128 Bit (nahezu unbegrenzt), hexadezimal mit Doppelpunkten. Parallelbetrieb durch **Dual-Stack**. Adressen 192.168.x.x sind private Adressen, im Internet nicht routbar, von außen nur mit NAT erreichbar.

### Netzplan (Ausschnitt)
Vorgänge C und D beginnen frühestens bei FAZ 9, Vorgang E bei FAZ 15. Merke: FAZ = größtes FEZ aller Vorgänger.

### Datenschutz und Wirtschaft
- Videoüberwachung: **Hinweispflicht** durch deutlich sichtbare Schilder (Zweck, Identität des Verantwortlichen) nach DSGVO.
- **Kennzeichenerkennung** gleicht LKW mit Lieferplänen ab und öffnet die Schranke automatisch. Nutzen: weniger Personalkosten und schnellere Abwicklung, Vermeidung von Standgeldern und Vertragsstrafen durch kürzere Durchlaufzeiten.
- Kaufvertrag: Nach fruchtlosem Ablauf einer angemessenen **Nachfrist** darf der Kunde zurücktreten.
- Nachhaltiger Vertrauensverlust: Kunden wandern ab, schlechte Referenzen erschweren die Neukundengewinnung.
- Netzwerkanalyse (`ping`): Antwortzeiten einer Kamera schwanken von 39 ms bis 863 ms (hoher **Jitter**) mit Paketverlust: Videostream ruckelt oder bricht ab.
- **Change Management** / digitale Transformation umfasst: Reorganisation, neue Technik, Neuausrichtung der Prozesse. Risiko: Ohne Fallback gibt es bei Fehlern im neuen System vollständigen Stillstand.
- **Ergonomie** am Arbeitsplatz: höhenverstellbarer Stuhl, externe Tastatur und Maus, externer höhenverstellbarer Monitor, blendfreies Licht.
- **Mehrmonitor-Anschluss mit einem Kabel:** DisplayPort 1.2 oder höher mit MST (Daisy Chain) oder Thunderbolt; Vorteil: weniger Kabel.
- **OOP-Vorteile:** Wiederverwendbarkeit durch Vererbung, Wartbarkeit durch Kapselung. Beispielklasse `ShippingCalculator` mit `maxWeight`, `expressSurcharge`, `upTo10kg`, `above10kg`.

### Versandkostenrechner (Schreibtischtest)
Ergebnisse: bis 10 kg 6,98 EUR; bis 10 kg mit Express 19,93 EUR (6,98 + 12,95); über 10 kg mit Express 26,93 EUR (13,98 + 12,95); Gesamtsumme 53,84 EUR bei mehr als 40 EUR mit **12,5 % Rabatt** ergibt 47,11 EUR (53,84 * 0,875).

## Einfach

Stell dir vor, eine Fabrik hängt Kameras auf, die Tag und Nacht filmen. Jede Kamera bekommt ihren Strom über das Netzwerkkabel (PoE), so braucht sie keine Steckdose. Strom ist wie Wasser: Leistung (Watt) = Druck (Volt) mal Menge (Ampere). Wenn die Kamera 24 Watt braucht und der Druck 48 Volt ist, fließt eine halbe Ampere.

Wie viele Daten fallen an? Jedes Bild hat 1920 mal 1080 Punkte, jeder Punkt braucht 24 Bit, und es gibt 30 Bilder pro Sekunde. Die Kompression macht es auf 30 Prozent kleiner. Das ergibt etwa 448 Millionen Bit pro Sekunde pro Kamera. Vier Kameras drei Tage lang: 53 Tebibyte, das ist ein riesiger Berg an Festplatten. Immer erst mit Sekunden und Kameras malnehmen, dann durch 8 für Byte, dann durch 1024 hoch 4.

Subnetz /25 heißt: Die Straße hat 128 Häuser, 2 sind reserviert (die erste Nummer ist der Straßenname, die letzte ist die Lautsprecherdurchsage an alle), bleiben 126 für Geräte.

Wenn die Kamera nicht funktioniert, fragt man wie ein Arzt: Ist das Kabel heil? Stimmt die Adresse? Leuchtet das Link-Licht? Findet sie den Namen im Telefonbuch (DNS)? Wenn die Antwortzeiten wild zwischen 39 und 863 Millisekunden hüpfen, ist die Leitung wackelig, das Video ruckelt.

Filmen darf man nur, wenn Schilder darauf hinweisen, wer filmt und warum. Das verlangt der Datenschutz.

## Merksatz
- I = P / U.
- Bitrate = Breite * Höhe * fps * Farbtiefe * Kompression, dann /8 für Byte, dann /1024 je Stufe.
- /25 = 126 Hosts, Broadcast = Netz + 127.
- Fehlersuche von unten nach oben: Kabel, Link-LED, IP, DNS.
- Videoüberwachung: Schilderpflicht (Hinweispflicht).
- FAZ = größtes FEZ der Vorgänger.

## Prüfungsfalle
- Bit und Byte vermischen: 448 Mbit/s sind 56 MB/s.
- Mit 1000 statt 1024 rechnen, wenn die Aufgabe TiB verlangt (TB = 1000^4, TiB = 1024^4).
- Beim /25-Netz 128 statt 126 Hosts angeben.
- Prozente falsch anwenden: 12,5 % Rabatt auf die Gesamtsumme = Faktor 0,875.
- PoE-Standards verwechseln: 802.3af = 15,4 W (PoE), 802.3at = 30 W (PoE+), 802.3bt = bis 90 W.
- Aufgabe nicht vollständig: Das PDF enthält nur Lösungen; Aufgabentexte sind rekonstruiert, Werte bei eigener Übung gegen die Originalaufgabe prüfen.

## Grafik
### Fehlersuche bei einer ausgefallenen Kamera
1. Techniker: prüft zuerst die Link-LED am Switch
2. Techniker -> Switch: LED aus, Patchkabel wird getauscht
3. Techniker -> Kamera: ipconfig / Webinterface zeigt falsche IP
4. Techniker -> Kamera: IP korrigieren oder DHCP aktivieren
5. Techniker -> DNS-Server: nslookup prüft den Hostnamen
6. Kamera -> Management-Software: Stream läuft wieder

## Lücken
- Die Stromstärke berechnet sich als I = {P / U}.
- PoE+ ist der Standard IEEE {802.3at}.
- Ein /25-Netz hat {126} nutzbare Hostadressen.
- Eine Kamera mit Infrarot kann bei {totaler Dunkelheit} aufnehmen.
- Hohe Schwankungen der Antwortzeit nennt man {Jitter}.

## Freitext
- F: Berechnen Sie den Strom einer PoE-Kamera mit 24 W bei 48 V. | M: I = P / U = 24 W / 48 V = 0,5 A = 500 mA. | P: 2
- F: Nennen Sie zwei Maßnahmen zur rechtskonformen Videoüberwachung. | M: Hinweisschilder mit Zweck und Verantwortlichem; Speicherung nur zweckgebunden und zeitlich begrenzt. | P: 2
- F: Erläutern Sie ein Risiko der Einführung eines neuen Systems ohne Fallback. | M: Bei unvorhersehbaren Fehlern gibt es kein einsatzbereites Backup, der Betrieb steht still. | P: 3
- F: Nennen Sie zwei Vorteile der objektorientierten Programmierung. | M: Wiederverwendbarkeit durch Vererbung und Modularität, Wartbarkeit durch Kapselung. | P: 2

## Szenario
### Speicherbedarf der Videoüberwachung (rekonstruiert)
Vier Kameras (Full HD 1920 x 1080, 30 fps, 24 Bit Farbtiefe, Kompression auf 30 %) sollen 72 Stunden aufzeichnen.
- F: Datenrate pro Kamera in Mbit/s? | A: 1920 * 1080 * 30 * 24 * 0,30 = 447.897.600 Bit/s, also ca. 448 Mbit/s.
- F: Speicherbedarf in TiB? | A: (448 Mbit/s * 4 * 72 * 3600) / (8 * 1024^4) ≈ 53 TiB.
- F: Wie wirkt sich 50 % Kompression statt 30 % aus? | A: Proportional: 53 TiB * 5/3 ≈ 88 TiB.

### Subnetz der Kameras (rekonstruiert)
Das Kameranetz 192.168.16.0 nutzt die Maske 255.255.255.128.
- F: Wie viele Hosts sind nutzbar? | A: 126.
- F: Netz- und Broadcastadresse? | A: 192.168.16.0 und 192.168.16.127.

## Übungen
- A: Berechnen Sie die Datenrate bei 2560 x 1440, 25 fps, 24 Bit, Kompression 40 %. | L: 2560 * 1440 = 3.686.400; * 25 = 92.160.000; * 24 = 2.211.840.000; * 0,4 = 884.736.000 Bit/s ≈ 885 Mbit/s.
- A: 53,84 EUR werden mit 12,5 % Rabatt berechnet. Endpreis? | L: 53,84 * 0,875 = 47,11 EUR.
- A: Wie viele Hosts hat ein /26-Netz? | L: 2^6 - 2 = 62.

## Karteikarten
- F: Welcher Standard liefert bis 30 W per PoE? | A: IEEE 802.3at (PoE+).
- F: Wie berechnet man die Stromstärke aus Leistung und Spannung? | A: I = P / U.
- F: Was bedeutet IR bei einer Kamera? | A: Infrarot für Aufnahmen bei Dunkelheit.
- F: Wozu dient ein Heater in einer Außenkamera? | A: Verhindert Beschlagen und Einfrieren der Linse.
- F: Wie viele Hosts hat ein /25-Netz? | A: 126.
- F: Wie lautet die Broadcast-Adresse von 192.168.16.0/25? | A: 192.168.16.127.
- F: Was ist Dual-Stack? | A: Parallelbetrieb von IPv4 und IPv6 auf denselben Geräten.
- F: Warum ist 192.168.x.x nicht aus dem Internet erreichbar? | A: Private Adressen sind nicht routbar, Zugriff nur mit NAT.
- F: Was bedeutet Jitter? | A: Schwankung der Laufzeit/Antwortzeit.
- F: Welche Pflicht gilt bei Videoüberwachung? | A: Hinweispflicht per Schild mit Zweck und Verantwortlichem (DSGVO).
- F: Welche Anschlusstechnik treibt mehrere Monitore mit einem Kabel? | A: DisplayPort 1.2+ mit MST oder Thunderbolt.
- F: Was ist FAZ bei mehreren Vorgängern? | A: Der größte FEZ aller Vorgänger.

## Quiz
? Wie groß ist der Strom einer PoE-Kamera mit 24 W bei 48 V?
* 0,5 A
- 2 A
- 1,15 A
- 0,05 A

? Welcher PoE-Standard liefert bis ca. 30 W?
* IEEE 802.3at
- IEEE 802.3af
- IEEE 802.11ac
- IEEE 802.1Q

? Wie viele nutzbare Hosts hat 192.168.16.0 mit 255.255.255.128?
* 126
- 128
- 254
- 62

? Was ist die Broadcast-Adresse dieses Netzes?
* 192.168.16.127
- 192.168.16.128
- 192.168.16.255
- 192.168.16.1

? Welches Verfahren erlaubt den Parallelbetrieb von IPv4 und IPv6?
* Dual-Stack
- NAT64 Only
- Subnetting
- VLAN-Tagging

? Was bedeutet Jitter?
* Schwankung der Antwortzeiten
- Verlust aller Pakete
- Falsche Subnetzmaske
- Fehlende Verschlüsselung

? Welche Pflicht besteht bei Videoüberwachung nach DSGVO?
* Hinweisschilder mit Zweck und Verantwortlichem
- Anmeldung bei der IHK
- Aufnahme nur nachts
- Verbot jeder Speicherung

? Welche Schnittstelle erlaubt mehrere Monitore über ein Kabel?
* DisplayPort 1.2 mit MST
- VGA
- HDMI 1.0 ohne MST
- PS/2

? Was bedeutet „Heater" bei einer Kamera?
* Heizung gegen Beschlagen und Einfrieren
- Kühlkörper
- Hitzeschutzfolie für den Chip
- Infrarot-Strahler

? Wie hoch ist der Preis nach 12,5 % Rabatt auf 53,84 EUR?
* 47,11 EUR
- 40,38 EUR
- 50,00 EUR
- 59,98 EUR

? Welche Aussagen zu privaten IPv4-Adressen sind richtig? (mehrere)
* 192.168.x.x ist ein privater Adressbereich.
* Zugriff aus dem Internet geht nur mit NAT oder Portweiterleitung.
- Sie sind im Internet direkt routbar.
- Sie werden ausschließlich bei IPv6 genutzt.
