---
id: ap1-a1-drucker
bereich: AP1
block: A1
kapitel: Hardware
titel: Drucker & Scanner
stufe: Einsteiger
quellen: [14_Übung_Drucker_Scanner.pdf]
verweise: [ap1-a1-usb, ap1-a6-druckserver]
---

## Profi

### Grundlagen
Ein Drucker überträgt digitale Daten (Text, Grafik) auf ein physisches Medium. Er empfängt einen Druckauftrag (in einer **Druckersprache**), wandelt ihn in ein Rasterbild um und bringt Farbmittel (Tinte, Toner, Farbband, Wachs) aufs Papier.

### Impact vs. Non-Impact
| Impact (anschlagend) | Non-Impact (nicht anschlagend) |
|---|---|
| Druckkopf schlägt mechanisch über ein Farbband aufs Papier | Farbe wird berührungslos aufgebracht |
| Nadeldrucker, Typenraddrucker | Laser, Tintenstrahl, Thermo, Sublimation |
| laut, **Durchschläge** möglich | leise, hohe Qualität |

### Verfahren und Schnittstellen
- **Verfahren**: Laser (elektrofotografisch), Tintenstrahl (Bubble-Jet/Piezo), Nadeldruck, Thermodirekt (Kassenbons, Etiketten), Thermotransfer (Etiketten mit Farbband), Thermosublimation (Fotos), 3D-Druck.
- **Schnittstellen**: USB, Ethernet (RJ45), WLAN (inkl. Wi-Fi Direct), Bluetooth, früher parallel (Centronics/LPT) und seriell. Netzwerkprotokolle: **IPP** (Internet Printing Protocol, Port 631), **LPD/LPR** (Port 515), **RAW/JetDirect** (Port 9100), AirPrint/Mopria.

### Druckersprachen
| Sprache | Herkunft | Eigenart |
|---|---|---|
| **PCL** (Printer Command Language) | HP | weit verbreitet in Bürodruckern, effizient, teils geräteabhängig |
| **PostScript** | Adobe | geräteunabhängige **Seitenbeschreibungssprache** (vektorbasiert), exakte Ausgabe, Standard im Grafik-/Druckgewerbe |
| **ESC/P** | Epson | Steuerbefehle (Escape-Sequenzen) für Nadeldrucker |
| PDF Direct / XPS | Adobe / Microsoft | Dokumente direkt drucken |
| ZPL | Zebra | Etikettendrucker |

### Tintenstrahl: Bubble-Jet vs. Piezo
| Bubble-Jet (thermisch) | Piezo |
|---|---|
| Heizelement erhitzt Tinte blitzartig → **Dampfblase** drückt Tropfen aus der Düse | **Piezokristall** verformt sich bei Spannung und presst den Tropfen heraus |
| Canon, HP | Epson (Brother) |
| Druckkopf oft in der Patrone (Verschleiß durch Hitze) | Druckkopf fest im Gerät, langlebig |
| weniger präzise Tropfengröße | Tropfengröße sehr genau steuerbar, auch wärmeempfindliche Tinten möglich |

**Schnelles Trocknen vs. Lebensdauer**: **Flüchtige Lösungsmittel** (z. B. Alkohole) in der Tinte lassen sie auf dem Papier schnell trocknen – verdunsten aber auch in Patrone und Düsen → Tinte trocknet ein, Düsen verstopfen. Deshalb Reinigungszyklen und Haltbarkeitsdaten.

### dpi und RIP
- **dpi** (dots per inch): Anzahl Druckpunkte pro Zoll (2,54 cm). Höher = feiner. Beispiel: 1200 × 1200 dpi. Nicht verwechseln mit **ppi** (Pixel pro Zoll, Bildauflösung) und **lpi** (Rasterweite im Offsetdruck).
- **RIP** (Raster Image Processor): Wandelt Druckdaten (PostScript, PDF, Vektorgrafik, Schriften) in ein **Rasterbild (Bitmap)** um, das das Druckwerk Punkt für Punkt ausgeben kann. Berechnet auch Farbseparation und Rasterung. Im Drucker (Hardware-RIP) oder als Software auf einem Server.

### Laserdrucker – Funktionsweise
1. **Aufladen**: Die Bildtrommel (Fotoleiter, OPC-Trommel) wird durch Ladekorona/Ladewalze gleichmäßig **negativ geladen**.
2. **Belichten**: Ein Laser (oder LED-Zeile) **entlädt** gezielt die Stellen, an denen gedruckt werden soll → latentes Bild.
3. **Entwickeln**: Geladener **Toner** (feines Kunststoffpulver mit Farbpigmenten) haftet an den belichteten Stellen.
4. **Übertragen**: Eine Transferwalze mit entgegengesetzter Ladung zieht den Toner aufs **Papier**.
5. **Fixieren**: Die **Fixiereinheit** schmilzt den Toner mit Hitze (ca. 180–200 °C) und Druck ins Papier.
6. **Reinigen**: Resttoner wird abgestreift, Trommel entladen.
Farblaser: vier Toner (CMYK), meist über ein Transferband.

| Laser – Vorteile | Laser – Nachteile |
|---|---|
| schnell bei hohen Volumen | teurer in der Anschaffung (Farbe) |
| niedrige Kosten pro Seite | **Feinstaub/Ozon**-Emission (Aufstellort lüften) |
| wischfest, Toner trocknet nicht ein | Fotoqualität schwächer als Tinte |
| gestochen scharfer Text | Aufwärmzeit, hoher Stromverbrauch der Fixiereinheit |

### Nadeldrucker
Werden weiter produziert, weil sie als Einzige **Durchschläge** (mehrlagige Formulare, Lieferscheine, Frachtbriefe) drucken können, **Endlospapier** verarbeiten, sehr **robust** und **günstig im Betrieb** sind (Logistik, Behörden, Werkstätten).

**Druckqualitäten**:
- **Draft**: Entwurfsqualität, schnell, sichtbare Punkte.
- **NLQ** (Near Letter Quality): nahezu Briefqualität – Zeichen werden mehrfach leicht versetzt gedruckt (langsamer).
- **LQ** (Letter Quality): Briefqualität, mit 24-Nadel-Druckköpfen in einem Durchgang.

### Flachbettscanner
Die Vorlage liegt auf einer Glasplatte. Ein **Schlitten** mit Lichtquelle fährt darunter entlang; das reflektierte Licht fällt über Spiegel und Linse auf einen **CCD-Sensor** (höhere Tiefenschärfe) oder direkt auf einen **CIS-Sensor** (flacher, sparsamer). Ein A/D-Wandler digitalisiert die Helligkeitswerte zeilenweise. Wichtige Kennwerte: **optische Auflösung** (dpi – nicht die interpolierte!), **Farbtiefe** (z. B. 48 Bit), **Dichteumfang** (Dmax).

**Schwarzer-Würfel-Test**: Ein Foto eines schwarzen Würfels auf dunklem Grund wird gescannt. Man prüft, ob in den **dunklen Bereichen** noch Kanten und Abstufungen erkennbar sind und wie stark das Rauschen ist → Aussage über **Dichteumfang (Dynamikbereich)** und Rauschverhalten des Scanners.

### Multifunktionsgeräte (MFP)
| Vorteile | Nachteile |
|---|---|
| Platz- und Kostenersparnis (ein Gerät) | Ausfall legt **alle Funktionen** lahm |
| eine Schnittstelle, eine Wartung, zentrale Verwaltung | Kompromisse bei Qualität einzelner Funktionen |
| Scan-to-Mail/-Ordner, Kopieren ohne PC | Abhängigkeit von Herstellerverbrauchsmaterial; **Sicherheitsrisiko** (interne Festplatte speichert Scans/Druckaufträge, offene Netzwerkdienste) |

## Einfach

Ein Drucker ist ein **Maler, der aufs Papier malt**, was der Computer ihm sagt.

**Impact und Non-Impact**: Ein Nadeldrucker ist wie eine alte **Schreibmaschine**: Er haut mit kleinen Nadeln auf ein Farbband – laut, aber er kann durch mehrere Blätter gleichzeitig drücken (Durchschläge). Laser- und Tintendrucker berühren das Papier gar nicht – sie „sprühen“ oder „kleben“ die Farbe nur drauf.

**Tintenstrahl**: Winzige Düsen spucken Tintentröpfchen, viel kleiner als ein Haar.
- **Bubble-Jet**: Die Tinte wird kurz erhitzt – es entsteht eine Blase wie beim Wasserkochen, die den Tropfen rausschubst.
- **Piezo**: Ein kleiner Kristall zuckt zusammen, wenn Strom kommt, und quetscht den Tropfen raus – wie wenn du eine Ketchupflasche drückst.

**Laserdrucker** funktioniert wie **Magie mit Staub**:
1. Eine Walze wird elektrisch aufgeladen (wie ein Luftballon, den du an den Haaren reibst).
2. Ein Laser „malt“ das Bild darauf, indem er die Ladung an bestimmten Stellen wegnimmt.
3. Farbpulver (Toner) bleibt nur an diesen Stellen kleben.
4. Das Pulver wird aufs Papier übertragen.
5. Eine heiße Walze **bügelt** das Pulver fest – deshalb kommt das Papier warm raus.

**dpi** = wie viele Punkte auf einen Zoll (2,54 cm) passen. Mehr Punkte = schärferes Bild, wie ein Mosaik mit kleineren Steinchen.

**RIP**: Der Computer schickt „Male einen Kreis!“. Der RIP ist der **Übersetzer**, der daraus eine Liste macht: „Punkt hier, Punkt da, Punkt dort …“, damit der Drucker weiß, wo genau er Farbe hinmachen soll.

**Druckersprachen** wie PCL und PostScript sind die **Sprachen**, in denen der Computer mit dem Drucker redet.

**Scanner** = umgekehrter Drucker: Eine Lampe fährt unter dem Blatt entlang, ein Sensor schaut sich jede Zeile an und macht daraus ein Bild.

**Multifunktionsgerät**: Drucker, Scanner, Kopierer und Fax in einem – wie ein Schweizer Taschenmesser. Praktisch, aber wenn es kaputt ist, geht gar nichts mehr. (Und ja – das Ticket „Drucker geht nicht“ ist der Klassiker jedes Admins!)

## Merksatz
- Laser-Ablauf: **Laden – Belichten – Entwickeln – Übertragen – Fixieren – Reinigen** → „**L**ecker **B**rot **E**rst **Ü**ber **F**euer **R**östen“.
- Bubble = **Blase durch Hitze**, Piezo = **Kristall drückt**.
- PostScript = **Adobe**, PCL = **HP**, ESC/P = **Epson**.
- Nadeldrucker lebt wegen **Durchschlägen**.
- RIP = Vektor → Raster.

## Prüfungsfalle
- dpi (Druckpunkte) ≠ ppi (Bildpixel).
- Interpolierte Scanner-Auflösung ist keine echte optische Auflösung.
- Laserdrucker: Feinstaub/Ozon → Aufstellort beachten (Arbeitsschutz).
- MFP mit interner Festplatte: vor Entsorgung Daten löschen (Datenschutz).
- Port 9100 = RAW-Druck, 631 = IPP, 515 = LPD.

## Grafik
### Laserdrucker Schritt für Schritt
Querschnitt mit Trommel; jede der sechs Stationen leuchtet nacheinander auf, Ladung (Minuszeichen) und Toner (Punkte) werden animiert, Papier läuft durch und dampft an der Fixiereinheit.

### Bubble-Jet vs. Piezo
Zwei Düsen im Zeitlupen-Querschnitt: links bildet sich eine Dampfblase, rechts biegt sich ein Kristall; beide schießen einen Tropfen.

### Flachbettscanner
Schlitten fährt unter einer Vorlage; Lichtstrahl, Spiegel, Sensor; Bild baut sich zeilenweise auf.

## Karteikarten
- F: Unterschied Impact und Non-Impact? | A: Impact: mechanischer Anschlag über Farbband (Nadeldrucker). Non-Impact: berührungslos (Laser, Tinte, Thermo).
- F: Nenne drei Druckersprachen. | A: PCL (HP), PostScript (Adobe), ESC/P (Epson).
- F: Unterschied Bubble-Jet und Piezo? | A: Bubble-Jet: Heizelement erzeugt Dampfblase. Piezo: Kristall verformt sich durch Spannung.
- F: Was bedeutet dpi? | A: Dots per Inch – Druckpunkte pro Zoll (2,54 cm).
- F: Was macht ein RIP? | A: Raster Image Processor – wandelt Druckdaten (PostScript/PDF/Vektor) in ein Rasterbild für das Druckwerk um.
- F: Sechs Schritte des Laserdrucks? | A: Aufladen, Belichten, Entwickeln, Übertragen, Fixieren, Reinigen.
- F: Warum gibt es noch Nadeldrucker? | A: Durchschläge/Formularsätze, Endlospapier, robust, günstig im Betrieb.
- F: Draft, NLQ, LQ? | A: Draft: Entwurf, schnell. NLQ: fast Briefqualität durch Mehrfachdruck. LQ: Briefqualität (24 Nadeln).
- F: Was prüft der Schwarze-Würfel-Test? | A: Dichteumfang/Dynamik und Rauschen des Scanners in dunklen Bereichen.
- F: Welcher Port für RAW-Druck? | A: TCP 9100.

## Quiz
? In welchem Schritt wird der Toner beim Laserdruck dauerhaft mit dem Papier verbunden?
* Fixieren
- Belichten
- Entwickeln
- Aufladen

? Welcher Drucker kann Durchschläge drucken?
* Nadeldrucker
- Laserdrucker
- Tintenstrahldrucker
- Thermosublimationsdrucker

? Welche Aufgabe hat ein RIP?
* Umwandlung von Druckdaten in ein Rasterbild
- Reinigung der Druckköpfe
- Verschlüsselung der Druckaufträge
- Kühlung der Fixiereinheit

? Welche Druckersprache stammt von Adobe?
* PostScript
- PCL
- ESC/P
- ZPL

? Welcher Nachteil gilt für Laserdrucker?
* Emission von Feinstaub und Ozon
- Tinte trocknet ein
- Keine Farbdrucke möglich
- Keine Netzwerkanbindung möglich

? Welche Kennzahl beschreibt die Auflösung eines Druckers?
* dpi (dots per inch)
- ppm nur bei Scannern
- Hz
- lm
! ppm (pages per minute) beschreibt dagegen die Druckgeschwindigkeit.

? Was sind Total Cost of Printing (Seitenkosten) im Wesentlichen?
* Verbrauchsmaterial, Wartung und Strom je gedruckter Seite
- Nur der Kaufpreis des Druckers
- Nur die Kosten für Papier
- Die Lizenzkosten des Treibers
! Tintenstrahldrucker sind oft günstig in der Anschaffung, aber teuer pro Seite.

? Was erkennt OCR beim Scannen?
* Text in Bildern, der in bearbeitbaren Text umgewandelt wird
- Farbfehler im Bild
- Viren im Dokument
- Die Papierstärke
! Optical Character Recognition.
