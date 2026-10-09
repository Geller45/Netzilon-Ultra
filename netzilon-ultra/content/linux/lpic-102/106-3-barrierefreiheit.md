---
id: linux-102-106-3-barrierefreiheit
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Benutzeroberflächen
titel: 106.3 Barrierefreiheit (Accessibility)
stufe: Einsteiger
quellen: [LPI-Learning-Material-102-500-de.pdf, 1.11_Linux_-_Benutzeroberflaechen_und_Desktops.pdf]
verweise: [linux-l2-11-desktops, linux-102-106-1-x11]
---

## Profi

### Lernziel (Gewicht 1)
Barrierefreiheitsfunktionen unter Linux kennen und einrichten.

### Tastatur- und Mausunterstützung
- **Tastaturhilfen** (Desktop-Einstellungen): **Einrasttasten** (Sticky Keys: Tasten wie Strg/Shift nacheinander statt gleichzeitig), **Anschlagverzögerung** (Slow Keys), **Tastenprellen ignorieren** (Bounce Keys), **Umschalttöne** (Toggle Keys), **Maustasten** (Mouse Keys: Zeiger mit dem Ziffernblock bewegen), **Doppelklick-Geschwindigkeit**, Klick bei Verweilen (Dwell Click).
- Auf Xorg-Ebene: `xkbset`, `setxkbmap`; Tastaturlayout in `/etc/default/keyboard`.

### Visuelle Hilfen
- **Hoher Kontrast**, große Schrift/Cursor, **Bildschirmlupe** (Zoom), Farbfilter, Skalierung.
- **Screenreader** (Bildschirmleser): **Orca** (GNOME, mit Sprachausgabe via espeak-ng/speech-dispatcher), **Brailleunterstützung** (BRLTTY, Braillezeile). Die Schnittstelle **AT-SPI** (Assistive Technology Service Provider Interface) verbindet Anwendungen mit Hilfsmitteln.
- **Bildschirmtastatur**: onboard, GNOME Bildschirmtastatur, **Spracheingabe**/Diktat.
- **Konsole**: BRLTTY und Speakup arbeiten auch ohne grafische Oberfläche; GRUB-Zugänglichkeit über serielle Konsole.
- Anmeldebildschirm: Zugänglichkeitsmenü im Display Manager.

## Einfach

**Barrierefreiheit** heißt: Der Computer soll **für alle** bedienbar sein – auch für Menschen, die schlecht sehen, nicht hören oder die Maus oder Tastatur schwer benutzen können.

Für die **Tastatur** gibt es Hilfen: **Einrasttasten** (Sticky Keys) lassen dich Tastenkombinationen wie Strg+Alt+Entf nacheinander drücken, statt alle gleichzeitig. **Anschlagverzögerung** (Slow Keys) wartet kurz, bevor ein Tastendruck zählt, damit Zittern keine Fehler macht. Mit **Mausersatz-Tasten** (Mouse Keys) steuerst du den Mauszeiger mit dem Ziffernblock.

Für die **Augen**: großer Text, starker **Kontrast** (hell auf dunkel), eine **Bildschirmlupe** und der **Screenreader Orca**, der den Bildschirminhalt vorliest oder an eine Braillezeile schickt. Wer nicht tippen kann, nutzt die **Bildschirmtastatur** oder Spracheingabe.

Das Zusammenspiel regelt eine unsichtbare Vermittlungsstelle namens **AT-SPI**: Sie erzählt Orca, welche Knöpfe und Texte gerade auf dem Bildschirm sind.

Wichtig für die Prüfung: Du musst nicht jede Einstellung auswendig können, aber die Begriffe (Sticky Keys, Slow Keys, Mouse Keys, Orca, BRLTTY, AT-SPI) solltest du richtig zuordnen.

## Merksatz
- **Sticky Keys = nacheinander statt gleichzeitig.**
- **Slow Keys = Anschlagverzögerung.**
- **Mouse Keys = Zeiger per Ziffernblock.**
- **Orca = Screenreader, BRLTTY = Braille.**
- **AT-SPI = Schnittstelle für Hilfsmittel.**

## Prüfungsfalle
- Einrasttasten helfen bei **Tastenkombinationen**, nicht bei langsamer Reaktion.
- **Orca** ist der Screenreader von GNOME, **BRLTTY** der Braille-Treiber.
- Die Bildschirmlupe vergrößert, ein Screenreader liest vor.
- AT-SPI ist eine **Schnittstelle**, kein Programm für Endnutzer.
- Hoher Kontrast ändert das Farbschema, nicht die Schriftgröße.

## Grafik

### Orca und AT-SPI
1. Anwendung -> AT-SPI: meldet Fensterinhalt
2. AT-SPI -> Orca: gibt Elemente weiter
3. Orca -> Sprachausgabe: espeak-ng / speech-dispatcher
4. Orca -> BRLTTY: Textausgabe auf Braillezeile
5. Benutzer: hört oder liest den Inhalt

## Lab
**Maschine**: debian01 (GNOME).
```bash
# auf debian01
sudo apt install orca onboard brltty
orca &                       # Screenreader (Super+Alt+S)
gsettings set org.gnome.desktop.a11y.keyboard stickykeys-enable true
gsettings set org.gnome.desktop.interface text-scaling-factor 1.5
```

## Befehle
- `orca` – Screenreader
- `onboard` – Bildschirmtastatur
- `gsettings set org.gnome.desktop.a11y…` – Einstellungen
- `setxkbmap` – Tastaturlayout
- `brltty` – Braillezeilen-Dienst

## Übungen
- A: Welche Funktion erlaubt Strg+Alt+Entf nacheinander? | L: Einrasttasten (Sticky Keys)
- A: Welches Programm liest den Bildschirm vor? | L: Orca
- A: Wie bewegt man den Mauszeiger ohne Maus? | L: Mouse Keys (Ziffernblock)
- A: Wofür steht AT-SPI? | L: Assistive Technology Service Provider Interface
- A: Wie ignoriert man zu kurze Tastendrücke? | L: Anschlagverzögerung (Slow Keys)

## Karteikarten
- F: Was sind Sticky Keys? | A: Einrasttasten, bei denen Modifikatortasten nacheinander gedrückt werden dürfen.
- F: Was sind Slow Keys? | A: Eine Verzögerung, bevor ein Tastendruck akzeptiert wird.
- F: Was sind Bounce Keys? | A: Ignorieren mehrfacher kurzer Tastendrücke (Tastenprellen).
- F: Was sind Mouse Keys? | A: Mauszeiger über den Ziffernblock steuern.
- F: Was ist Orca? | A: Screenreader/Vergrößerung für GNOME.
- F: Was ist BRLTTY? | A: Hintergrunddienst für Braillezeilen.
- F: Was ist AT-SPI? | A: Schnittstelle zwischen Anwendungen und Hilfsmitteln.
- F: Was ist eine Bildschirmtastatur? | A: Virtuelle Tastatur am Bildschirm (z. B. onboard).

## Quiz
? Welche Funktion erlaubt das nacheinander Drücken von Strg und Alt?
* Einrasttasten
- Mouse Keys
- Slow Keys
- Bounce Keys

? Welcher Screenreader gehört zu GNOME?
* Orca
- Onboard
- BRLTTY
- Cheese

? Wofür ist BRLTTY?
* Braillezeilen
- Sprachausgabe
- Bildschirmlupe
- Farbfilter

? Was bewirken Mouse Keys?
* Zeiger per Ziffernblock steuern
- Doppelklick verlängern
- Maus deaktivieren
- Touchpad kalibrieren

? Was beschreibt AT-SPI?
* Schnittstelle für Hilfstechnologien
- Ein Tastaturlayout
- Ein Display Manager
- Ein Netzwerkprotokoll

? Was bewirkt Slow Keys?
* Tastendruck wird erst nach Verzögerung akzeptiert
- Tasten wiederholen schneller
- Tasten rasten ein
- Tasten werden getauscht

? Welches Hilfsmittel eignet sich für Nutzer, die nicht tippen können?
* Bildschirmtastatur/Spracheingabe
- Hoher Kontrast
- Einrasttasten allein
- Lupe

? Was ändert hoher Kontrast?
* Farbschema des Desktops
- Lautstärke
- Tastaturlayout
- Mausgeschwindigkeit

## Spickzettel
- Sticky · Slow · Bounce · Toggle · Mouse Keys
- Orca (Screenreader) · BRLTTY (Braille) · AT-SPI
- Hoher Kontrast · Lupe · Bildschirmtastatur (onboard)
