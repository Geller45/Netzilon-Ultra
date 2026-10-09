---
id: server-hw-displays-uebung
bereich: AP1
pruefungen: [AP1, Schule]
fach: ITK / Grundlagen
block: S3
kapitel: Hardware
titel: Displaytechnologien – Folien und Übung 11 komplett gelöst
stufe: Einsteiger
typ: uebung
quellen: [11_Displaytechnologien.pdf, 11_Übung_Displaytechnologien.pdf]
verweise: [ap1-a1-displays, ap1-a1-grafikkarte, server-hw-mobil-uebung]
---

## Profi

Die Theorie steht im Thema **Displaytechnologien** (ap1-a1-displays). Hier die Kernaussagen der Folien von Herrn Beging und die **15 Aufgaben der Übung 11** mit Lösung.

### Folien kompakt
| Technik | Prinzip | Stärken | Schwächen |
|---|---|---|---|
| **CRT** (Röhre) | Elektronenstrahl schreibt zeilenweise auf Leuchtschicht | Auflösung frei wählbar, schlierenfrei, kein Blickwinkelproblem | Flimmern unter ~75 Hz, schwer, viel Strom, Magnetfelder (Entmagnetisieren) – **Legacy** |
| **LCD/TFT** | Flüssigkristalle drehen bei Spannung das Licht, Hintergrundbeleuchtung | hell, homogen, flimmerfrei, flach | Schwarzwert schwächer, **nur eine native Auflösung**, Schaltzeiten (WB/G2G) |
| **LED-Backlight** | **weiterhin LCD**, Beleuchtung per LED statt Leuchtstoffröhre | flacher, sparsamer, langlebig, Local Dimming | Blooming bei Local Dimming |
| **Plasma** | Gasentladung erzeugt UV, das Leuchtstoffe anregt | sehr guter Schwarzwert, keine Schlieren | hoher Verbrauch (helligkeitsabhängig), Einbrennen, verliert Brillanz – **Legacy (seit 2014 nicht mehr produziert)** |
| **OLED** | organische Schichten leuchten selbst | perfektes Schwarz, extrem flach, biegsam, schnell | Einbrennrisiko, empfindlich gegen Wasser/Sauerstoff, teurer |
| **TN** | Twisted Nematic | schnell, günstig | Blickwinkel, Farbtreue (6-Bit + Dithering) |
| **MVA/PVA** | Vertical Alignment | hoher statischer Kontrast, gute Blickwinkel | etwas langsamer, teurer als TN |
| **IPS** | In-Plane Switching | beste Farbtreue und Blickwinkel | „IPS-Glow“, teurer |

**Reaktionszeit**: Zeitspanne für eine Helligkeitsänderung von **10 % auf 90 %**; G2G-Werte (Grau zu Grau) sind kleiner und schöner fürs Marketing. LCDs arbeiten nach dem **Halteprinzip** (*sample and hold*) – Bewegungsunschärfe lässt sich nur mit hoher Bildrate oder Backlight-Strobing reduzieren.

## Einfach

Ein Bildschirm ist wie eine **riesige Wand aus winzigen Lämpchen** (Pixel), jedes mit **rot, grün und blau**.
- **Röhre (CRT)**: Ein **Lichtstrahl malt** das Bild ganz schnell Zeile für Zeile. Malt er zu langsam (60-mal pro Sekunde), sieht man das **Flackern**.
- **LCD**: Hinter der Wand leuchtet eine **große Lampe**, und vor jedem Pixel ist ein **Fensterladen**, der sich mehr oder weniger öffnet. Weil die Lampe immer etwas durchscheint, ist Schwarz eher **dunkelgrau**.
- **OLED**: Jedes Pixel ist **seine eigene Lampe**. Für Schwarz schaltet es sich einfach **aus** – deshalb ist Schwarz wirklich schwarz.
- **E-Ink** (eBook-Reader): Wie **Magnetkügelchen**, die schwarz oder weiß nach oben drehen. Sie brauchen nur beim **Umblättern** Strom – deshalb hält der Akku wochenlang.

## Merksatz
- **LED-TV ist ein LCD** mit LED-Licht.
- **TN schnell – VA Kontrast – IPS Farbe.**
- **OLED: selbstleuchtend, echtes Schwarz.**
- Reaktionszeit = **10 → 90 %**.

## Prüfungsfalle
- **Quellenfehler korrigiert:** Die Folie nennt für ISO 9241 „Klasse 0 bis 4“ – richtig ist **ISO 9241-307 mit den Klassen 0 bis III**.
- „Edge-LED aus den **Ecken**“ (Folie) – genauer: von den **Rändern/Kanten** über einen Lichtleiter.
- Plasma und Mirasol sind **Legacy** (nicht mehr produziert).

## Grafik
### Pixel-Shifting gegen Einbrennen
1. Panel: Logo steht stundenlang an gleicher Stelle
2. Pixel: dieselben Zellen altern stärker → Geisterbild
3. Panel: Pixel-Shifting verschiebt das Bild alle paar Minuten um 1–2 Pixel
4. Pixel: Belastung verteilt sich, Einbrennen wird verzögert

## Übungen
- A: 1. Erklären Sie prägnant die CRT-Technik. | L: Kathodenstrahlröhre (Braun’sche Röhre): Eine Glühkathode erzeugt Elektronenstrahlen, die von Magnetfeldern abgelenkt zeilenweise von oben nach unten über die Phosphor-Leuchtschicht geführt werden; eine Lochmaske sorgt dafür, dass jeder Strahl nur seine Farbe (RGB) trifft.
- A: 2. Vergleichen Sie CRT und TFT. | L: CRT: tief, schwer, hoher Verbrauch, Flimmern bei niedriger Frequenz, Auflösung frei wählbar, schlierenfrei, guter Schwarzwert. TFT: flach, leicht, sparsam, flimmerfrei, nur native Auflösung scharf (sonst Interpolation), Schaltzeiten/Schlieren möglich, Schwarzwert durch Backlight schwächer.
- A: 3. Unterschied der Geschwindigkeitsangaben grey-to-grey und white/black? | L: Black/White (bzw. Rise+Fall) misst den Wechsel Schwarz→Weiß→Schwarz bzw. 10–90 % der vollen Helligkeit; G2G misst Übergänge zwischen Grautönen – meist kürzer und daher werbewirksamer, aber praxisnäher für Spiele/Filme.
- A: 4. Warum flimmert ein CRT bei 60 Hz subjektiv? | L: Jeder Bildpunkt leuchtet nach dem Auftreffen nur kurz nach; bei 60 Bildaufbauten pro Sekunde nimmt besonders das periphere Sehen das Nachlassen der Helligkeit wahr, zusätzlich Interferenz mit 50-Hz-Kunstlicht. Ab ca. 75–85 Hz gilt es als flimmerfrei.
- A: 5. Was ist LED-Backlight, Vor- und Nachteile? | L: LCD-Panel, dessen Hintergrundbeleuchtung aus LEDs statt Leuchtstoffröhren (CCFL) besteht. Vorteile: flacher, sparsamer, langlebiger, quecksilberfrei, Local Dimming für besseren Kontrast. Nachteile: ungleichmäßige Ausleuchtung (Clouding) bei Edge-LED, Blooming/Halos beim Dimmen, teils PWM-Flimmern.
- A: 6. Unterschied Edge-LED und Full-LED? | L: Edge-LED: LEDs nur an den Rändern, Licht wird über eine Lichtleiterplatte verteilt – sehr flach und günstig, aber ungleichmäßiger, kaum Local Dimming. Full-LED (Direct/Full-Array): LEDs über die gesamte Rückfläche, gleichmäßig und mit vielen Dimming-Zonen (Mini-LED) – bessere Kontraste, dicker und teurer.
- A: 7. Funktionsweise eines Plasma-Monitors? | L: Jedes Subpixel ist eine winzige Zelle mit Edelgas (Neon/Xenon). Eine Spannung zündet eine Gasentladung (Plasma), das UV-Licht erzeugt; dieses regt rote, grüne oder blaue Leuchtstoffe zum Leuchten an – selbstleuchtend wie bei der Röhre.
- A: 8. Wie hilft Pixel-Shifting gegen Einbrennen? | L: Das Bild wird regelmäßig um wenige Pixel verschoben, statische Inhalte belasten dadurch nicht immer dieselben Zellen; die Alterung verteilt sich. Nicht für jeden verträglich (leichte Bewegung sichtbar), verhindert Einbrennen nicht vollständig.
- A: 9. Vergleichen Sie OLED und LCD. | L: OLED: selbstleuchtende Pixel, kein Backlight, perfektes Schwarz/unendlicher Kontrast, sehr schnelle Reaktion, biegsam, dünn; Nachteile: Einbrennen, organisches Material altert (v. a. Blau), teurer, Helligkeit vollflächig begrenzt. LCD: Backlight + Flüssigkristalle, günstig, sehr hell, kein Einbrennen, aber schwächerer Schwarzwert und Blickwinkel.
- A: 10. Beschreiben Sie PVA, TN und IPS mit Vor-/Nachteilen und Einsatz. | L: TN: schnell (1 ms), günstig, aber schlechte Blickwinkel und Farbtreue → Gaming/Office-Budget. PVA/MVA: sehr hoher statischer Kontrast, gute Blickwinkel (178°), etwas langsamer → Filme, Büro, Bildbearbeitung. IPS: beste Farbtreue und Blickwinkel, gute Geschwindigkeit, teurer, IPS-Glow → Grafik, Foto, Medizin, Tablets.
- A: 11. Unterschied Pixelfehler und Subpixelfehler? | L: Pixelfehler: ganzer Bildpunkt dauerhaft hell (Typ 1) oder dunkel (Typ 2). Subpixelfehler (Typ 3): nur eines der drei Subpixel (R, G oder B) defekt – sichtbar als farbiger Punkt.
- A: 12. Auswirkung von ISO 9241-307 auf die Pixelfehlerklassen? | L: Sie ersetzt ISO 13406-2 (Klassen I–IV). Neue Klassen 0 bis III mit strengeren Prüfbedingungen (u. a. Betrachtungswinkel, Reflexion) und angepassten Grenzwerten pro Million Pixel; Klasse 0 = fehlerfrei. Hersteller geben meist Klasse I an.
- A: 13. Beschreiben Sie eine Mobiltelefon-Displaytechnik (TFT, S/W, AMOLED). | L: AMOLED (Active Matrix OLED): jedes Pixel leuchtet selbst und wird über eine Dünnschichttransistor-Matrix aktiv angesteuert – schnell, blickwinkelstabil, sehr hell, energiesparend bei dunklen Inhalten (Always-On-Display); teurer, Einbrennrisiko. (TFT-LCD: günstig, langlebig, braucht Beleuchtung; S/W: reflektiv, ohne Licht ablesbar, sehr sparsam, langsam, grob – veraltet.)
- A: 14. Besonderheiten von E-Ink und Einsatzbereiche? | L: Elektrophoretisches Display: geladene schwarze/weiße Partikel in Mikrokapseln; Strom nur beim Umschalten (bistabil), papierähnlich, reflektiv, in Sonne gut lesbar, augenschonend. Langsam, kaum Farbe/Video. Einsatz: E-Reader, Preisschilder (ESL), Anzeigetafeln, Notizgeräte.
- A: 15. Vorteile von Mirasol gegenüber E-Ink? | L: Mirasol (Qualcomm, IMOD-Technik, Lichtinterferenz an Mikrospiegeln) bot Farbe und videotaugliche Schaltzeiten bei ähnlich niedrigem Verbrauch und guter Sonnenlesbarkeit. Wurde nach wenigen Geräten eingestellt – heute Legacy.

## Karteikarten
- F: Ist ein LED-Fernseher ein eigener Displaytyp? | A: Nein – ein LCD mit LED-Hintergrundbeleuchtung
- F: Wie wird die Reaktionszeit definiert? | A: Helligkeitswechsel von 10 % auf 90 %
- F: Welches Panel hat die beste Farbtreue? | A: IPS
- F: Welches Panel ist am schnellsten und günstigsten? | A: TN
- F: Was ist ein Subpixelfehler? | A: Ein defektes Teil (R, G oder B) eines Pixels
- F: Welche Norm regelt Pixelfehlerklassen heute? | A: ISO 9241-307 (Klassen 0 bis III)
- F: Warum hat OLED perfektes Schwarz? | A: Pixel leuchten selbst und schalten für Schwarz ganz ab
- F: Wann verbraucht E-Ink Strom? | A: Nur beim Umschalten des Bildinhalts
- F: Gegen welches Problem hilft Pixel-Shifting? | A: Einbrennen statischer Bildinhalte
- F: Full-LED vs. Edge-LED? | A: Full-LED leuchtet flächig von hinten (besseres Local Dimming), Edge-LED nur von den Rändern

## Quiz
? Was ist ein „LED-Monitor“ technisch?
* Ein LCD mit LED-Hintergrundbeleuchtung
- Ein selbstleuchtendes OLED
- Ein Plasma-Display
- Eine Röhre mit LEDs

? Welche Panel-Technik bietet die beste Blickwinkelstabilität und Farbtreue?
* IPS
- TN
- CRT mit 60 Hz
- Edge-LED

? Welche Norm ersetzt ISO 13406-2?
* ISO 9241-307
- ISO 27001
- IEC 62040
- ISO 9001

? Was misst die G2G-Angabe?
* Übergänge zwischen Grautönen
- Schwarz zu Weiß und zurück
- Die Bildwiederholrate
- Den Kontrast

? Welche Technik ist bistabil und braucht nur beim Umschalten Strom?
* E-Ink
- AMOLED
- TN-LCD
- Plasma

? Warum flimmert ein CRT bei 60 Hz?
* Die Leuchtpunkte verblassen zwischen zwei Bildaufbauten sichtbar
- Die Hintergrundbeleuchtung pulsiert
- Die Flüssigkristalle sind zu langsam
- Der Pixelfehler wandert

? Welcher Nachteil gilt für OLED?
* Einbrenngefahr bei statischen Inhalten
- Schlechter Schwarzwert
- Benötigt Hintergrundbeleuchtung
- Keine Biegsamkeit möglich

? Welcher Pixelfehler-Typ ist ein ständig leuchtendes Pixel?
* Typ 1
- Typ 2
- Typ 3
- Typ 0

## Spickzettel
- CRT Strahl (Legacy), LCD + Backlight, LED = LCD, Plasma (Legacy), OLED selbstleuchtend
- TN schnell/billig, VA Kontrast, IPS Farbe/Blickwinkel
- Reaktionszeit 10→90 %, G2G kleiner
- Pixelfehler Typ 1 hell, Typ 2 dunkel, Typ 3 Subpixel; ISO 9241-307 Klassen 0–III
- E-Ink: Strom nur beim Umschalten; Mirasol: Farbe, Legacy
