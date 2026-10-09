---
id: ihk-softwareergonomie-ux
bereich: Prüfung
block: IHK
kapitel: Projekt und Entwicklung
titel: Softwareergonomie, UI/UX und Barrierefreiheit – ISO 9241, ASELSFI, WCAG, Wireframe, Styleguide
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [Softwareergonomie-UI-UX.md (Obsidian v2), UI-UX-Ergonomie.md (v1), KI_Software.pdf, WiSo-Arbeitsschutz-Umwelt-Ethik.md]
verweise: [ihk-ki-barrierefreiheit, wiso-arbeitsschutz, ihk-softwaretests-qs]
---

## Profi

### ISO 9241
Eine **mehrteilige Normenreihe** „Ergonomie der Mensch-System-Interaktion“. Prüfungsrelevant:
- **Teil 11:** Gebrauchstauglichkeit (usability) = **Effektivität** (Ziel erreicht?) + **Effizienz** (Aufwand?) + **Zufriedenstellung** (satisfaction) im Nutzungskontext (Nutzer, Ziel, Aufgaben, Ressourcen, Umgebung).
- **Teil 110:** die sieben Grundsätze der Dialoggestaltung.
- **Teil 210:** menschzentrierter Gestaltungsprozess, iterativ: Nutzungskontext → Anforderungen → Gestaltungslösung → Evaluation.

### Sieben Grundsätze (ASELSFI)
| # | Grundsatz | Kern | Verletzung |
|---|---|---|---|
| 1 | **A**ufgabenangemessenheit | nur anbieten, was die Aufgabe braucht | 30 Pflichtfelder für eine Newsletter-Anmeldung |
| 2 | **S**elbstbeschreibungsfähigkeit | System erklärt sich selbst (Labels, Tooltips, Fortschritt) | Button „OK“ ohne Kontext, kryptischer Fehlercode |
| 3 | **E**rwartungskonformität | konsistent, Konventionen einhalten | „Speichern“ löscht |
| 4 | **L**ernförderlichkeit | erleichtert das Erlernen (Onboarding, Hinweise) | keine Hilfe, jede Seite anders |
| 5 | **S**teuerbarkeit | Nutzer bestimmt Tempo/Richtung (Zurück, Abbrechen, Undo) | Zwangs-Wizard, Auto-Logout während der Eingabe |
| 6 | **F**ehlertoleranz | Fehler vermeiden, leicht korrigieren (Validierung, Bestätigung) | Formular wird bei Fehler komplett geleert |
| 7 | **I**ndividualisierbarkeit | Anpassung (Schriftgröße, Dark Mode, Sprache) | feste 8-px-Schrift |

Die neuere ISO 9241-110:2020 nennt Grundsätze etwas anders (u. a. „Nutzerbindung“); die IHK-Unterlagen lehren weiter den klassischen 7er-Kanon.

### UI, Usability, UX
**UI** = wie es aussieht (Optik, Layout), **Usability** = wie gut es funktioniert (messbar: Klicks, Fehlerrate; ISO 9241-11), **UX** = wie es sich insgesamt anfühlt, vor/während/nach der Nutzung (ISO 9241-210). Usability ist **Teil** der UX. Beispiel: Bestellung in 3 Schritten (hohe Effizienz), aber stressige Oberfläche → gute Usability, schlechte UX.

### WCAG und Barrierefreiheit
**POUR:** Perceivable (wahrnehmbar: Alt-Texte, Untertitel, Kontrast, nicht nur Farbe), Operable (bedienbar: Tastatur, kein Zeitzwang, keine Blitzeffekte), Understandable (verständlich: klare Sprache, konsistente Navigation), Robust (semantisches HTML, ARIA korrekt).
Stufen **A** (Basis), **AA** (praktischer Standard, gesetzlich gefordert), **AAA** (höchstes). Recht: BITV 2.0 (öffentliche Stellen), EU-Richtlinie 2016/2102, **BFSG** (setzt den European Accessibility Act um, gilt seit 28.06.2025 für viele private Produkte und Dienstleistungen, z. B. Onlineshops).
**Kontrast (AA):** normaler Text **4,5 : 1**, großer Text (≥ 18 pt oder ≥ 14 pt fett) und UI-Elemente **3 : 1**; AAA: 7 : 1 bzw. 4,5 : 1. Information nie nur über Farbe (ca. 8 % der Männer farbfehlsichtig) → Farbe + Icon + Text.
**Technik:** Screenreader (NVDA, JAWS, VoiceOver, TalkBack) brauchen semantisches HTML und Alt-Texte; dekorative Bilder `alt=""`. Tastaturbedienung mit logischer Tab-Reihenfolge, sichtbarem Fokus, ohne Keyboard-Trap. **ARIA** (`aria-label`, `role`, `aria-live`, `aria-expanded`, `aria-hidden`); Regel: „Kein ARIA ist besser als schlechtes ARIA – erst natives HTML.“ `alt` ist **kein** ARIA-Attribut.

### Wireframe – Mockup – Prototyp
| | Wireframe | Mockup | Prototyp |
|---|---|---|---|
| Inhalt | grobes Struktur-Gerüst, Grautöne | statisches Design mit Farben/Fonts/Bildern | klickbares Modell |
| Fidelity | low | meist high | low oder high |
| Interaktiv | nein | nein | **ja** |
| Zweck | Anordnung klären | Optik abstimmen | Nutzerfluss testen |

### Corporate Identity und Design
**CI** = gesamtes Erscheinungsbild (Design, Kommunikation, Verhalten, Kultur). **CD** (Corporate Design) = visueller Teil: Logo, Hausfarben, Hausschrift. Der **Styleguide** hält verbindliche CD-Vorgaben fest (Hex-Farben, Schriften, Logo-Abstände). Gestaltgesetze: Nähe, Ähnlichkeit, Geschlossenheit usw.

## Einfach

Stell dir vor, du baust einen Automaten für Süßigkeiten.

**Usability:** Kommt jeder an sein Gummibärchen (Effektivität)? Mit wenigen Handgriffen (Effizienz)? Und freut er sich dabei (Zufriedenheit)? **UX** ist die ganze Geschichte: Wie fühlt sich der Weg zum Automaten an, das Warten, das Auspacken, die Erinnerung danach? **UI** ist nur das Aussehen: Farbe, Knöpfe, Schrift.

**Die sieben Regeln (ASELSFI):** Zeige nur Knöpfe, die man braucht. Beschrifte alles verständlich („Münze einwerfen“). Mache es wie alle anderen Automaten (rot = Stopp). Hilf beim Lernen. Lass den Benutzer abbrechen und zurückgehen. Wenn jemand falsch drückt, merkt der Automat es und lässt dich korrigieren. Und: Die Schrift soll man größer stellen können.

**Barrierefreiheit** heißt: Der Automat funktioniert für alle. Ein blinder Mensch braucht Vorlesen (Screenreader) und Beschreibungen für Bilder. Wer keine Maus nutzen kann, braucht die Tastatur. Wer Rot und Grün nicht unterscheidet, braucht zusätzlich ein Symbol. Genug Kontrast bedeutet: Dunkelgrauer Text auf weiß ist gut lesbar, hellgrau auf weiß nicht.

**POUR** zum Merken: Man muss es **P**ercepieren (wahrnehmen), **O**perieren (bedienen), **U**nderstehen (verstehen), und es muss **R**obust sein (mit vielen Geräten klappen).

**Wireframe, Mockup, Prototyp:** Erst eine Bleistiftskizze (Wireframe), dann ein farbiges Bild (Mockup), zum Schluss ein Modell zum Ausprobieren (Prototyp, klickbar).

## Merksatz
- ASELSFI: Aufgabe, Selbstbeschreibung, Erwartung, Lernen, Steuerung, Fehler, Individuell.
- UI = Aussehen, Usability = Funktion, UX = Gefühl.
- POUR: Perceivable, Operable, Understandable, Robust.
- Kontrast: 4,5 : 1 normal, 3 : 1 groß.
- Wireframe = Struktur, Mockup = Look, Prototyp = klickbar.
- Kein ARIA ist besser als schlechtes ARIA.

## Prüfungsfalle
- ISO 9241 ist eine Reihe, nicht eine Norm; Teil 11 ≠ Teil 110.
- Kontrast: „4,5 : 1“ allein ist unvollständig, für großen Text/UI-Elemente gilt 3 : 1.
- `alt` ist natives HTML, kein ARIA.
- Usability und UX nicht gleichsetzen; Usability ist Teil der UX.
- Mockup ist nicht interaktiv, Prototyp schon.
- Erwartungskonformität (Konsistenz) nicht mit Selbstbeschreibungsfähigkeit (Erklärung) mischen.
- Info nur über Farbe (rot/grün) verstößt gegen WCAG 1.4.1.
- Barrierefreiheit gilt seit 2025 (BFSG) auch für viele private Anbieter.

## Grafik
### Menschzentrierter Gestaltungsprozess
1. Team: Nutzungskontext verstehen
2. Team: Nutzungsanforderungen ableiten
3. Team -> Nutzer: Entwurf als Wireframe zeigen
4. Nutzer -> Team: Feedback aus Usability-Test
5. Team: überarbeiten, Zyklus wiederholen

### Von der Skizze zum Produkt
1. Designer: Wireframe (Struktur)
2. Designer -> Kunde: Mockup (Farben, Fonts)
3. Kunde -> Designer: Freigabe oder Änderung
4. Designer -> Entwickler: Klickprototyp und Styleguide übergeben

## Übungen
- A: Ein Formular löscht bei einem Fehler alle Eingaben. Welcher Grundsatz ist verletzt? | L: Fehlertoleranz
- A: Ein Button „Speichern“ löscht den Datensatz. Welcher Grundsatz? | L: Erwartungskonformität
- A: Welches Kontrastverhältnis gilt nach WCAG AA für normalen Text? | L: mindestens 4,5 : 1

## Lücken
- Usability besteht aus {Effektivität}, {Effizienz} und Zufriedenstellung.
- Die vier WCAG-Prinzipien heißen {POUR}.
- Ein {Prototyp} ist im Gegensatz zum Mockup klickbar.
- Dekorative Bilder erhalten ein leeres {alt}-Attribut.

## Zuordnen
### Normenteil zu Inhalt
- ISO 9241-11 => Usability: Effektivität, Effizienz, Zufriedenstellung
- ISO 9241-110 => Grundsätze der Dialoggestaltung
- ISO 9241-210 => Menschzentrierter Gestaltungsprozess
- WCAG AA => praktisch relevante Konformitätsstufe

## Reihenfolge
### Von der Idee zur Oberfläche
1. Nutzungskontext analysieren
2. Wireframe erstellen
3. Mockup gestalten
4. Prototyp testen
5. Styleguide an Entwicklung übergeben

## Freitext
- F: Nennen Sie vier der sieben Grundsätze der Dialoggestaltung und je ein Beispiel. | M: z. B. Fehlertoleranz (Bestätigung beim Löschen), Steuerbarkeit (Abbrechen/Undo), Individualisierbarkeit (Schriftgröße änderbar), Selbstbeschreibungsfähigkeit (aussagekräftige Fehlermeldungen). | P: 4
- F: Erläutern Sie den Unterschied zwischen Usability und UX. | M: Usability: Gebrauchstauglichkeit während der Nutzung (Effektivität, Effizienz, Zufriedenstellung). UX: gesamtes Erlebnis vor, während, nach der Nutzung inkl. Emotion und Markenwahrnehmung. | P: 3
- F: Nennen Sie zwei Maßnahmen für Barrierefreiheit einer Webseite. | M: Alt-Texte für Bilder; ausreichender Kontrast; Tastaturbedienbarkeit; semantisches HTML; Untertitel. | P: 2

## Spickzettel
- ISO 9241-11 Usability, -110 Dialog, -210 Prozess
- ASELSFI = 7 Grundsätze
- UI Aussehen / Usability Funktion / UX Gefühl
- WCAG: POUR, A/AA/AAA
- Kontrast 4,5:1 normal, 3:1 groß/UI
- Wireframe / Mockup / Prototyp
- BITV 2.0, BFSG ab 28.06.2025
- Styleguide = CD-Vorgaben

## Karteikarten
- F: Woraus besteht Usability nach ISO 9241-11? | A: Effektivität, Effizienz und Zufriedenstellung im Nutzungskontext
- F: Nennen Sie die sieben Grundsätze der Dialoggestaltung. | A: Aufgabenangemessenheit, Selbstbeschreibungsfähigkeit, Erwartungskonformität, Lernförderlichkeit, Steuerbarkeit, Fehlertoleranz, Individualisierbarkeit
- F: Was bedeutet POUR? | A: Perceivable, Operable, Understandable, Robust (WCAG-Prinzipien)
- F: Welcher Kontrast gilt für normalen Text nach WCAG AA? | A: 4,5 : 1
- F: Welcher Kontrast gilt für großen Text und UI-Elemente? | A: 3 : 1
- F: Was ist ein Wireframe? | A: Grobes Layout-Gerüst ohne Design, low-fidelity
- F: Was ist ein Prototyp? | A: Klickbares, interaktives Modell zum Testen von Nutzerfluss
- F: Was regelt das BFSG? | A: Barrierefreiheit für viele Produkte/Dienstleistungen privater Anbieter, gilt ab 28.06.2025
- F: Wozu dient ein Styleguide? | A: Verbindliche Corporate-Design-Vorgaben (Farben, Schriften, Logo)
- F: Welche Aufgabe haben Screenreader? | A: Bildschirminhalte vorlesen; benötigen semantisches HTML und Alt-Texte
- F: Wofür steht ARIA? | A: Accessible Rich Internet Applications – Attribute für zusätzliche Semantik
- F: Was ist ein Keyboard-Trap? | A: Element, aus dem man per Tastatur nicht mehr herauskommt – Barrierefreiheitsfehler

## Quiz
? Aus welchen drei Merkmalen besteht Usability nach ISO 9241-11?
* Effektivität, Effizienz, Zufriedenstellung
- Design, Farbe, Schrift
- Sicherheit, Speed, Preis
- Barrierefreiheit, Kompatibilität, Cloud
! Im Nutzungskontext.

? Ein Formular löscht bei einem Eingabefehler alle Felder. Welcher Grundsatz ist verletzt?
* Fehlertoleranz
- Aufgabenangemessenheit
- Individualisierbarkeit
- Lernförderlichkeit
! Fehler sollen leicht korrigierbar sein.

? Welches Kontrastverhältnis fordert WCAG AA für normalen Text?
* 4,5 : 1
- 3 : 1
- 7 : 1
- 2 : 1
! Großer Text: 3 : 1.

? Was bedeutet das „O“ in POUR?
* Operable (bedienbar)
- Optional
- Optimized
- Online
! Z. B. Tastaturbedienung.

? Welches Artefakt ist klickbar und interaktiv?
* Prototyp
- Wireframe
- Mockup
- Styleguide
! Mockup ist statisch.

? Wofür gilt das BFSG seit 28.06.2025?
* Für viele Produkte und Dienstleistungen privater Anbieter, z. B. Onlineshops
- Nur für Behörden
- Nur für Schulen
- Für Hardwareentwicklung allein
! Umsetzung des European Accessibility Act.

? Wie sollte ein dekoratives Bild für Screenreader ausgezeichnet werden?
* alt=""
- aria-label="Bild"
- Gar nicht
- alt="Bild1.jpg"
! Leerer Alt-Text wird übersprungen.

? Was gilt als erste ARIA-Regel?
* Native HTML-Elemente verwenden, bevor ARIA genutzt wird
- Immer role="button" verwenden
- ARIA ersetzt alt
- ARIA ist Pflicht für jedes Element
! Kein ARIA ist besser als schlechtes ARIA.

? Wofür steht das „E“ in ASELSFI?
* Erwartungskonformität
- Effizienz
- Eindeutigkeit
- Erreichbarkeit
! Konsistenz und Konventionen.

? Ein Button „Speichern“ löscht Daten. Welcher Grundsatz?
* Erwartungskonformität
- Steuerbarkeit
- Lernförderlichkeit
- Selbstbeschreibungsfähigkeit
! Verhalten widerspricht der Erwartung.
