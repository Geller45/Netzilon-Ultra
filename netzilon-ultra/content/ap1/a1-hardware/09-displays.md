---
id: ap1-a1-displays
bereich: AP1
block: A1
kapitel: Hardware
titel: Displaytechnologien
stufe: Einsteiger
quellen: [11_Übung_Displaytechnologien.pdf]
verweise: [ap1-a1-grafikkarte, ap1-a1-mobilarchitekturen]
---

## Profi

### CRT (Kathodenstrahlröhre) – Legacy
Eine **Elektronenkanone** schießt einen Elektronenstrahl, der durch Magnetfelder (Ablenkspulen) **zeilenweise** über die Leuchtschicht (Phosphor) auf der Innenseite der Glasröhre gelenkt wird. Getroffene Phosphorpunkte leuchten kurz auf. Eine **Loch- oder Streifenmaske** sorgt dafür, dass jeder der drei Strahlen (R, G, B) nur „seine“ Farbpunkte trifft.

**Flimmern bei 60 Hz**: Der Phosphor verblasst schnell nach dem Treffer. Bei 60 Bildern pro Sekunde nimmt das Auge (besonders das periphere Sehen) das Hell-Dunkel-Pulsieren wahr → Flimmern, Kopfschmerzen. Empfohlen waren **≥ 85 Hz** (ergonomisch 100 Hz).

### CRT vs. TFT/LCD
| | CRT | TFT/LCD |
|---|---|---|
| Prinzip | Leuchtschicht durch Elektronenstrahl | Flüssigkristalle steuern Licht einer Hintergrundbeleuchtung |
| Bauform | tief, schwer | flach, leicht |
| Verbrauch | hoch | gering |
| Flimmern | ja (bildwiederholfrequenzabhängig) | nein (Pixel halten ihren Zustand) |
| Auflösung | variabel ohne Qualitätsverlust | feste **native Auflösung**, andere Auflösungen werden interpoliert (unscharf) |
| Blickwinkel | sehr gut | panelabhängig |
| Strahlung/Magnetfelder | ja | kaum |

**TFT** (Thin-Film Transistor) bezeichnet die **aktive Matrix**: Jeder Subpixel hat einen eigenen Transistor, der ihn gezielt ansteuert.

### Reaktionszeit
- **Black-White-Black (b/w)**: Zeit von Schwarz auf Weiß und zurück (voller Schaltvorgang).
- **Grey-to-Grey (g2g)**: Zeit zwischen zwei Graustufen – im Alltag häufiger, meist mit **Overdrive** (Spannungsüberhöhung) beschleunigt. Herstellerangaben (z. B. „1 ms g2g“) sind oft Bestwerte und nicht vergleichbar.

### LED-Backlight
Ein „LED-Monitor“ ist meist ein **LCD mit LED-Hintergrundbeleuchtung** statt Leuchtstoffröhren (CCFL).
- **Vorteile**: dünner, sparsamer, quecksilberfrei, höhere Helligkeit, längere Lebensdauer, dimmbar.
- **Nachteile**: teils **PWM-Flimmern** beim Dimmen, ungleichmäßige Ausleuchtung (Clouding, Blooming), bläulicher Farbstich bei günstigen Modellen.

| Edge-LED | Full-LED (Full Array) |
|---|---|
| LEDs nur am Rand, Licht wird über Lichtleiterplatte verteilt | LEDs flächig hinter dem Panel |
| sehr dünn, günstig | dicker, teurer |
| ungleichmäßiger, kaum Local Dimming | **Local Dimming** in Zonen → besserer Kontrast/HDR; mit tausenden Zonen = **Mini-LED** |

### Plasma – Legacy
Jeder Subpixel ist eine kleine Zelle mit **Edelgas** (Neon/Xenon). Eine Spannung zündet ein Plasma, das **UV-Licht** erzeugt; dieses bringt eine **Phosphorschicht** zum Leuchten (selbstleuchtend). Vorteile: sehr guter Kontrast, Blickwinkel, schnelle Reaktion. Nachteile: hoher Verbrauch, schwer, **Einbrennen** statischer Bilder. **Pixel-Shifting** verschiebt das Bild regelmäßig um wenige Pixel, damit nicht immer dieselben Zellen gleich belastet werden. Wird seit ca. 2014 nicht mehr produziert.

### OLED vs. LCD
| | OLED | LCD |
|---|---|---|
| Licht | **selbstleuchtend** (organische LEDs pro Subpixel) | Hintergrundbeleuchtung + Flüssigkristall als Filter |
| Schwarz | perfekt (Pixel aus) → unendlicher Kontrast | Restlicht, Grau statt Schwarz |
| Reaktionszeit | < 0,1 ms | 1–5 ms |
| Bauform | sehr dünn, **biegbar/faltbar** | dicker |
| Nachteile | **Einbrenngefahr**, begrenzte Lebensdauer (v. a. blaue Subpixel), geringere Vollbild-Helligkeit, teuer | Blooming, schlechteres Schwarz |

### Panel-Techniken (LCD)
| Panel | Vorteile | Nachteile | Einsatz |
|---|---|---|---|
| **TN** (Twisted Nematic) | sehr schnell, günstig | schlechte Blickwinkel, schwache Farben | E-Sport, Budget |
| **VA/PVA** (Vertical Alignment) | hoher Kontrast (3000:1+), gutes Schwarz | Schlieren bei dunklen Übergängen, Farbverschiebung zur Seite | Filme, Office, Curved-Gaming |
| **IPS** (In-Plane Switching) | beste Farben, stabile Blickwinkel | geringerer Kontrast (~1000:1), „IPS-Glow“, teurer | Grafik/Foto, Allrounder |

### Pixelfehler
- **Pixelfehler**: Ein kompletter Bildpunkt (alle drei Subpixel R, G, B) ist dauerhaft hell oder dunkel.
- **Subpixelfehler**: Nur ein Farb-Subpixel ist defekt → farbiger Punkt.
- Früher **ISO 13406-2** mit Klassen I–IV (Anzahl erlaubter Fehler pro Million Pixel). Diese wurde durch **ISO 9241-307** ersetzt: Klassen **0 bis III**, strengere Prüfbedingungen (u. a. Blickwinkel, Reflexion) und angepasste Grenzwerte. Hersteller geben meist Klasse I oder II an; „pixelfehlerfrei“ wird oft nur als freiwillige Garantie zugesichert.

### Mobile Displaytechniken
- **TFT-LCD** (IPS): günstig, gut bei Sonnenlicht mit hoher Helligkeit, Hintergrundbeleuchtung braucht Energie.
- **AMOLED** (Active-Matrix OLED): selbstleuchtend, Schwarz spart Energie (Dark Mode!), sehr dünn, Always-On-Display möglich; Einbrenn-Risiko, PWM-Flimmern bei niedriger Helligkeit.
- **Schwarz-Weiß-LCD** (monochrom, passiv): extrem sparsam, ältere Handys, Uhren, Taschenrechner.

### E-Ink (elektronisches Papier)
Elektrophoretisches Display: Winzige Kapseln enthalten weiße (positiv) und schwarze (negativ) Pigmente, die durch Spannung nach oben oder unten wandern. **Bistabil**: Das Bild bleibt **ohne Strom** stehen; Energie wird nur beim Bildwechsel verbraucht. Reflektiert Umgebungslicht wie Papier → augenschonend, **in Sonne gut lesbar**. Nachteile: langsamer Bildaufbau, Geisterbilder, begrenzte Farben. Einsatz: **E-Reader**, elektronische Preisschilder, Türschilder, Bushaltestellen-Anzeigen.

### Mirasol (Qualcomm) – Legacy
Reflektive Technik auf Basis von **Interferenz** (IMOD – Interferometric Modulator, Prinzip wie bei Schmetterlingsflügeln). Vorteile gegenüber E-Ink: **Farbe**, **schnell genug für Video**, ebenfalls sehr sparsam und in Sonnenlicht lesbar. Wurde nach wenigen Geräten eingestellt.

## Einfach

**Röhrenbildschirm (CRT)**: Das war der dicke Kasten-Fernseher von Oma. Darin sitzt eine „Kanone“, die winzige Teilchen auf die Scheibe schießt – ganz schnell, Zeile für Zeile, wie ein Drucker, der blitzschnell druckt. Wo es trifft, leuchtet es kurz. Weil das Leuchten schnell verblasst, sieht man bei zu langsamem Tempo ein **Flimmern**.

**Flachbildschirm (LCD/TFT)**: Hinten ist eine Lampe, die immer leuchtet. Davor stehen Millionen winzige **Jalousien** (Flüssigkristalle). Jede Jalousie lässt mehr oder weniger Licht durch – so entsteht das Bild. Weil die Lampe nicht blinkt, flimmert nichts.

**LED-Monitor** heißt meist nur: Die Lampe hinten besteht aus LEDs. **Edge-LED**: Lampen nur am Rand – wie eine Taschenlampe, die von der Seite in ein Aquarium leuchtet. **Full-LED**: viele Lampen direkt dahinter – dann kann man dunkle Stellen einzeln abdunkeln.

**OLED**: Hier gibt es **keine Lampe hinten**. Jeder einzelne Bildpunkt ist selbst ein winziges Lämpchen. Soll etwas schwarz sein, geht das Lämpchen einfach aus – echtes Schwarz! Nachteil: Wenn lange dasselbe Bild angezeigt wird (z. B. ein Senderlogo), kann es sich **einbrennen**, wie ein Schatten.

**Plasma**: Jeder Bildpunkt ist ein Mini-Leuchtröhrchen mit Gas. Sah toll aus, war aber schwer und stromhungrig – gibt es nicht mehr.

**TN, VA, IPS** sind verschiedene Arten, die Jalousien zu drehen:
- **TN** ist der Sprinter: schnell, aber von der Seite sieht das Bild komisch aus.
- **VA** ist der Nachtmensch: super dunkles Schwarz, aber ein bisschen träge.
- **IPS** ist der Künstler: die schönsten Farben, egal von wo man schaut.

**Pixelfehler**: Ein Bildpunkt ist kaputt und bleibt immer an oder aus – wie eine kaputte Glühbirne in einer Lichterkette. Ist nur eine Farbe kaputt, ist es ein Subpixelfehler.

**E-Ink** ist wie **Zaubersand**: Schwarze und weiße Körnchen werden nach oben oder unten gezogen. Wenn das Bild fertig ist, braucht es **keinen Strom mehr** – deshalb hält ein E-Reader wochenlang. Und in der Sonne liest man es wie ein echtes Buch.

## Merksatz
- **LCD filtert Licht, OLED erzeugt Licht.**
- TN = **T**empo, VA = **V**iel Kontrast, IPS = **I**deale Farben.
- E-Ink braucht nur Strom, wenn sich das Bild **ändert** (bistabil).
- g2g ist geschönt, b/w ist der volle Wechsel.
- Pixelfehler-Norm neu: **ISO 9241-307** (ersetzt 13406-2).

## Prüfungsfalle
- „LED-Monitor“ ist meist ein LCD mit LED-Backlight, kein OLED.
- Nicht-native Auflösung auf TFT → unscharfes Bild (Interpolation).
- Einbrennen betrifft Plasma und OLED, nicht klassische LCDs.
- Reaktionszeiten verschiedener Messmethoden nicht direkt vergleichen.

## Grafik
### LCD-Aufbau (Explosionsansicht)
Schichten fahren auseinander: Backlight → Polarisator → Flüssigkristall mit TFT → Farbfilter → Polarisator. Ein Pixel wird angesteuert, die Kristalle drehen sich und Licht tritt aus.

### OLED vs. LCD im Dunkeln
Zwei Bildschirme zeigen dasselbe Nachtbild; beim LCD schimmert Licht durch das Schwarz, beim OLED sind die Pixel komplett aus.

### Panel-Vergleich
Drei Monitore drehen sich um 60°; TN verfärbt sich, VA wird blasser, IPS bleibt stabil.

### E-Ink-Kapsel
Kapsel mit schwarzen und weißen Kügelchen; Spannung wechselt, Kügelchen wandern; Stromzähler läuft nur während des Wechsels.

## Karteikarten
- F: Warum flimmert ein CRT bei 60 Hz? | A: Der Phosphor verblasst zwischen zwei Bildaufbauten; bei 60 Hz nimmt das Auge das Pulsieren wahr.
- F: Was bedeutet TFT? | A: Thin-Film Transistor – aktive Matrix, jeder Subpixel hat einen eigenen Transistor.
- F: Unterschied g2g und b/w? | A: g2g misst Wechsel zwischen Graustufen (meist kürzer), b/w den vollen Wechsel Schwarz-Weiß-Schwarz.
- F: Edge-LED vs. Full-LED? | A: Edge: LEDs am Rand, dünn, ungleichmäßig. Full: LEDs flächig, Local Dimming, besserer Kontrast.
- F: Funktionsweise Plasma? | A: Gaszellen werden gezündet, erzeugen UV-Licht, das Phosphor zum Leuchten bringt.
- F: Wogegen hilft Pixel-Shifting? | A: Gegen Einbrennen – Bild wird regelmäßig um einige Pixel verschoben.
- F: Hauptunterschied OLED und LCD? | A: OLED ist selbstleuchtend, LCD braucht Hintergrundbeleuchtung.
- F: Stärken von IPS? | A: Beste Farbtreue und Blickwinkelstabilität.
- F: Stärken von VA? | A: Hoher Kontrast, tiefes Schwarz.
- F: Unterschied Pixel- und Subpixelfehler? | A: Pixelfehler: ganzer Bildpunkt defekt; Subpixelfehler: nur ein Farbkanal defekt.
- F: Warum ist E-Ink so sparsam? | A: Bistabil – Strom nur beim Bildwechsel.

## Quiz
? Welches Panel eignet sich am besten für Bildbearbeitung?
* IPS
- TN
- VA
- CRT

? Welche Technik benötigt keine Hintergrundbeleuchtung?
* OLED
- LCD mit Edge-LED
- TN-Panel
- IPS-Panel

? Welche Norm regelt Pixelfehlerklassen aktuell?
* ISO 9241-307
- ISO 13406-2
- IEEE 802.3
- DIN 5008

? Warum ist E-Ink in der Sonne gut lesbar?
* Es reflektiert das Umgebungslicht wie Papier
- Es besitzt eine besonders helle Hintergrundbeleuchtung
- Es arbeitet mit einer Elektronenkanone
- Es verwendet Plasma-Zellen

? Was passiert, wenn ein TFT nicht in seiner nativen Auflösung betrieben wird?
* Das Bild wird interpoliert und wirkt unscharf
- Das Bild flimmert stärker
- Der Monitor schaltet sich ab
- Die Farben werden invertiert

? Wie berechnet man die Pixeldichte eines Displays?
* Diagonale in Pixeln geteilt durch die Diagonale in Zoll (ppi)
- Breite mal Höhe in Zentimetern
- Bildwiederholrate mal Farbtiefe
- Helligkeit geteilt durch Kontrast
! Höhere ppi bedeuten schärfere Darstellung.

? Welches Panel bietet typischerweise die kürzeste Reaktionszeit, aber eingeschränkte Blickwinkel?
* TN-Panel
- IPS-Panel
- VA-Panel
- E-Ink
! TN ist schnell und günstig, IPS farbtreu, VA kontraststark.

? Was gibt die Farbtiefe eines Displays an?
* Anzahl Bit pro Farbkanal bzw. Pixel und damit die darstellbaren Farben
- Die Größe des Displays
- Die Helligkeit in Nits
- Die Anzahl der Anschlüsse
! 8 Bit pro Kanal ergeben ca. 16,7 Mio. Farben.
