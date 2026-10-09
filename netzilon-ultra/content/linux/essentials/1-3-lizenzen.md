---
id: linux-ess-open-source-lizenzen
bereich: Linux
fach: Linux I
pruefungen: [LPIC-1, Schule]
block: Linux Essentials
kapitel: Thema 1 – Die Linux-Gemeinschaft und eine Karriere in Open Source
titel: 1.3 Open-Source-Software und -Lizenzen
stufe: Einsteiger
quellen: [LPI-Learning-Material-010-160-de.pdf]
verweise: [linux-ess-open-source-anwendungen]
---

## Profi

### Lernziel (Gewicht 1)
Freie Software, Open Source, Lizenzmodelle (GPL, BSD, Creative Commons) und Geschäftsmodelle verstehen.

### Vier Freiheiten (FSF)
0. Programm für jeden Zweck **ausführen**, 1. **studieren/ändern** (Quellcode nötig), 2. **weiterverbreiten**, 3. **verbesserte Versionen** verteilen. Freie Software (FSF) betont Freiheit, **Open Source** (OSI, Open Source Definition) betont Nutzen und Entwicklungsmodell.

### Lizenzen
- **Copyleft**: Abgeleitete Werke müssen unter derselben Lizenz stehen. **GPL** (v2/v3; Linux-Kernel GPLv2), **LGPL** (Bibliotheken dürfen auch in proprietärer Software gelinkt werden), **AGPL** (auch bei Netzwerknutzung).
- **Permissiv**: **BSD**, **MIT**, **Apache 2.0**: fast alles erlaubt, Hinweis auf Urheber nötig; Weitergabe auch als proprietäre Software.
- **Creative Commons** (für Inhalte, nicht Software): CC0, CC BY, BY-SA (share alike), BY-NC (nicht kommerziell), BY-ND (keine Bearbeitung).
- Proprietär/Freeware/Shareware: nicht frei. Begriffe: **FOSS/FLOSS**, **Public Domain**.

### Geschäftsmodelle
Support- und Wartungsverträge (Red Hat, SUSE, Canonical), Dual-Licensing, Open Core, Spenden/Sponsoring, Hosting/Cloud-Services, Schulungen. „Frei“ heißt **nicht kostenlos** („free as in freedom, not free beer“).

## Einfach

Wenn du ein Computerprogramm benutzt, gilt immer eine **Lizenz**, das ist die Spielregel: Was darf ich damit tun? Bei **freier Software** sind die Regeln sehr großzügig: Du darfst sie **benutzen, anschauen, ändern und weitergeben**. Dafür muss der Bauplan (Quellcode) offen sein.

Es gibt zwei Familien. Die **GPL** ist wie ein Rezept mit einer Bedingung: „Du darfst es verändern und verkaufen, aber dein neues Rezept muss genauso frei bleiben.“ Das nennt man **Copyleft**. Die **BSD-/MIT-Lizenzen** sind lockerer: „Mach damit, was du willst, nenn nur meinen Namen.“ Jemand darf damit sogar ein geschlossenes Produkt bauen.

Für Bilder, Texte und Musik gibt es **Creative Commons**. Zum Beispiel erlaubt „CC BY-SA“ Weitergabe mit Namensnennung und gleicher Lizenz.

Wichtig: „Frei“ heißt nicht „gratis“. Man kann mit freier Software Geld verdienen, etwa durch Support, Schulungen oder Hosting. Red Hat tut genau das.

## Merksatz
- **GPL = Copyleft: frei bleibt frei.**
- **BSD/MIT/Apache = permissiv.**
- **Frei = Freiheit, nicht Gratisbier.**
- **CC: BY (Name), SA (gleiche Lizenz), NC (nicht kommerziell), ND (unverändert).**

## Prüfungsfalle
- Open Source ist nicht automatisch kostenlos; Freeware ist nicht automatisch Open Source.
- Der Linux-Kernel steht unter **GPLv2**.
- LGPL ≠ GPL: Bibliotheken dürfen proprietär gelinkt werden.
- Creative Commons gilt für Inhalte, nicht als Softwarelizenz.

## Grafik

### Copyleft vs. permissiv
1. Entwickler -> Anwender: GPL-Software, Quellcode offen
2. Anwender: ändert die Software
3. Anwender -> Dritte: muss unter GPL weitergeben (Copyleft)
4. Entwickler -> Firma: BSD-Software
5. Firma: darf sie proprietär weitergeben

## Karteikarten
- F: Wie viele Freiheiten definiert die FSF? | A: Vier (0 bis 3).
- F: Was bedeutet Copyleft? | A: Abgeleitete Werke müssen unter gleicher Lizenz stehen.
- F: Nenne eine permissive Lizenz. | A: BSD, MIT oder Apache 2.0.
- F: Unter welcher Lizenz steht der Linux-Kernel? | A: GPL Version 2.
- F: Was bedeutet CC BY-SA? | A: Namensnennung, Weitergabe unter gleichen Bedingungen.
- F: Was bedeutet CC BY-NC? | A: Nur nicht kommerzielle Nutzung.
- F: Wofür steht FLOSS? | A: Free/Libre Open Source Software.
- F: Wie verdient Red Hat Geld? | A: Support, Subskriptionen, Services.
- F: Was ist Dual-Licensing? | A: Software gleichzeitig unter freier und kommerzieller Lizenz.
- F: Was regelt die LGPL? | A: Bibliotheken dürfen auch von proprietärer Software genutzt werden.

## Quiz
? Welche Lizenz verlangt, dass Ableitungen frei bleiben?
* GPL
- MIT
- BSD
- Apache 2.0

? Welche Lizenz ist permissiv?
* MIT
- GPL
- AGPL
- LGPL v3 only

? Was beschreibt „free as in freedom“?
* Freiheit, nicht Preis
- Kostenlos
- Werbefrei
- Ohne Support

? Wofür stehen die Buchstaben ND in Creative Commons?
* Keine Bearbeitung
- Nicht digital
- Neue Daten
- Nur Download

? Unter welcher Lizenz steht der Linux-Kernel?
* GPLv2
- BSD
- MIT
- Proprietär

? Wie verdienen Open-Source-Firmen Geld?
* Durch Support und Services
- Gar nicht
- Nur durch Werbung
- Durch Quellcode-Verbot

? Was ist Freeware?
* Kostenlos nutzbar, aber nicht notwendig frei
- Immer Open Source
- Immer GPL
- Public Domain

? Für welche Inhalte gilt Creative Commons?
* Texte, Bilder, Musik
- Nur Kernel-Code
- Nur Hardware
- Nur Treiber

## Spickzettel
- 4 Freiheiten · Copyleft = GPL
- Permissiv: BSD, MIT, Apache
- CC: BY SA NC ND
- Kernel = GPLv2
- Frei ≠ gratis
