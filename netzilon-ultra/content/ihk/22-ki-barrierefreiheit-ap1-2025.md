---
id: ihk-ki-barrierefreiheit
bereich: AP1
block: IHK
kapitel: AP1 Katalog 2025
titel: KI, Barrierefreiheit und weitere AP1-Themen 2025
stufe: Fortgeschritten
fach: PV – AP1
pruefungen: [AP1]
quellen: [KI_Software.pdf, AP1_Lernplan, Lernzettel_AP1AP2_2024.pdf]
verweise: [ihk-pruefungsaufbau, ihk-handlungsschritte, ihk-berechnungen-lernzettel, ihk-infosicherheit-recht]
---

## Profi

### KI-Software
- **Maschinelles Lernen**: *überwachtes* Lernen (gekennzeichnete Daten, Klassifikation/Vorhersage), *unüberwachtes* Lernen (Muster in unmarkierten Daten, z. B. Clustering), *bestärkendes* Lernen (Belohnung und Bestrafung).
- **NLP** (Sprachverarbeitung: Chatbots, Übersetzung, Sprachassistenten), Bild- und Spracherkennung, Expertensysteme, Robotik, Predictive Analytics, Automatisierung.
- Voraussetzungen: große Datenmengen, Algorithmen, leistungsfähige Hardware (GPUs).
- **KI in der Anwendungsentwicklung**: Code-Vervollständigung und -Generierung (Copilot, IntelliCode), Fehlererkennung und Debugging, Testautomatisierung (Unit-, Integrations-, Regressionstests), Refactoring, Aufgabenpriorisierung, automatische Dokumentation.
- **Risiken** (typische Prüfungsfragen): Halluzinationen (erfundene, falsche Antworten), Bias/Diskriminierung durch Trainingsdaten, **Datenschutz** (personenbezogene Daten in Prompts, Abfluss an Anbieter), **Urheberrecht** und Lizenzen, mangelnde Nachvollziehbarkeit, Abhängigkeit, Sicherheitslücken in generiertem Code. Ergebnisse immer **prüfen**.

### Barrierefreiheit
- Ziel: Angebote für Menschen mit Einschränkungen nutzbar (Sehen, Hören, Motorik, Kognition).
- Maßnahmen: ausreichender **Kontrast** (WCAG: mindestens **4,5 : 1** für normalen Text), **Alternativtexte** für Bilder, Bedienung per **Tastatur**, **Screenreader**-taugliche Struktur (Überschriften, Beschriftungen), skalierbare Schrift, Untertitel/Transkripte, Hilfsmittel wie **Braillezeile** und Spracheingabe, keine Information nur über Farbe.

### Weitere AP1-Punkte
- **Rechenregel Einheiten**: RAM/HDD-Kapazitäten binär (1024), Übertragungsraten dezimal (1000); Byte × 8 = Bit.
- **Englische Fehlermeldungen** verstehen (z. B. access denied, connection timed out, file not found, permission denied).
- **Katalog 2025**: RAID-Konfiguration, SAN, JOIN/GROUP BY, Struktogramme, Vererbung, LTE/5G, ISO 2700x und NoSQL sind entfernt. Dauerbrenner bleiben Nutzwertanalyse, Netzplan, Schreibtischtest.
- **Prüfungs-Checkliste**: Operator beachten, Einheiten mitschreiben, Rechenweg zeigen, Kriterien nummerieren, so viele Argumente wie Punkte.

## Einfach

**KI ist wie ein sehr fleißiger Praktikant.** Sie hat unglaublich viele Texte gelesen und kann schnell Vorschläge machen: Code ergänzen, Fehler suchen, Tests schreiben. Aber sie versteht nicht wirklich, was sie sagt. Manchmal erfindet sie etwas, das gut klingt und trotzdem falsch ist. Das nennt man Halluzination. Darum muss ein Mensch alles prüfen, bevor es in ein echtes Programm kommt.

**Drei Arten zu lernen:** Beim überwachten Lernen zeigst du dem Computer viele Fotos mit Beschriftung („Katze“, „Hund“), bis er neue Fotos selbst sortieren kann. Beim unüberwachten Lernen gibst du ihm Fotos ohne Namen, und er bildet allein Gruppen. Beim bestärkenden Lernen probiert er etwas aus und bekommt Pluspunkte oder Minuspunkte, wie bei einem Videospiel.

**Vorsicht beim Datenschutz:** Schreibe nie Namen, Passwörter oder Kundendaten in eine öffentliche KI. Die Daten landen sonst bei einer fremden Firma. Auch Urheberrecht ist ein Thema: Wem gehört das, was die KI erzeugt, und woher hat sie ihr Wissen?

**Barrierefreiheit** heißt, dass jeder deine Seite nutzen kann. Wer schlecht sieht, braucht starken Kontrast und eine Vorlesefunktion. Darum bekommt jedes Bild einen Text, der beschreibt, was darauf zu sehen ist. Wer keine Maus nutzen kann, muss alles mit der Tastatur bedienen können. Blinde Menschen lesen mit einer Braillezeile, die Schrift als fühlbare Punkte zeigt.

**Zum Rechnen:** Speicher zählt der Computer in 1024er-Schritten, Leitungen in 1000er-Schritten. Das muss man in der Prüfung sauber trennen.

## Merksatz
- Überwacht = mit Etikett, unüberwacht = ohne Etikett, bestärkend = Belohnung.
- KI-Ergebnisse prüfen, keine personenbezogenen Daten eingeben.
- Kontrast mindestens 4,5 : 1, Bilder brauchen Alternativtext.
- Speicher 1024, Übertragung 1000.

## Prüfungsfalle
- Halluzination mit Absicht verwechseln: Die KI täuscht nicht bewusst, sie erzeugt wahrscheinlich klingende Texte.
- Vorteile von KI nennen, aber die Risiken (Datenschutz, Urheberrecht, Bias) vergessen.
- Bit und Byte vertauschen.
- Barrierefreiheit nur auf Blinde beschränken, obwohl auch Hören, Motorik und Kognition zählen.
- Themen lernen, die 2025 aus dem Katalog gestrichen wurden, statt Dauerbrenner zu üben.

## Grafik
### KI-gestützte Entwicklung
1. Entwickler -> KI-Assistent: Aufgabe oder Kommentar eingeben
2. KI-Assistent -> Entwickler: Code-Vorschlag
3. Entwickler: Vorschlag prüfen (Fachwissen, Sicherheit, Lizenz)
4. Entwickler -> Test: Unit-Tests ausführen
5. Entwickler: Übernehmen oder verwerfen

## Spickzettel
- Überwacht / unüberwacht / bestärkend
- Risiken: Halluzination, Bias, Datenschutz, Urheberrecht
- WCAG-Kontrast 4,5 : 1
- RAM 1024, Leitung 1000
- Dauerbrenner: Nutzwertanalyse, Netzplan, Schreibtischtest

## Karteikarten
- F: Was ist überwachtes Lernen? | A: Training mit gekennzeichneten Daten
- F: Was ist unüberwachtes Lernen? | A: Mustererkennung in unmarkierten Daten
- F: Was ist bestärkendes Lernen? | A: Lernen durch Belohnung und Bestrafung
- F: Was ist eine Halluzination bei KI? | A: Erfundene, aber plausibel klingende falsche Ausgabe
- F: Was bedeutet NLP? | A: Natürliche Sprachverarbeitung (Natural Language Processing)
- F: Welcher Kontrast gilt nach WCAG für normalen Text? | A: Mindestens 4,5 : 1
- F: Wozu dienen Alternativtexte? | A: Beschreiben Bilder für Screenreader
- F: Was ist eine Braillezeile? | A: Hilfsmittel, das Bildschirmtext in Blindenschrift ausgibt
- F: Welche Einheit gilt für RAM-Größen? | A: Binär, 1024
- F: Was bleibt im AP1-Katalog 2025 Dauerbrenner? | A: Nutzwertanalyse, Netzplan, Schreibtischtest

## Quiz
? Welche Lernart verwendet gekennzeichnete Trainingsdaten?
* Überwachtes Lernen
- Unüberwachtes Lernen
- Bestärkendes Lernen
- Kein Lernen

? Was ist ein Risiko beim Einsatz von KI-Assistenten?
* Preisgabe personenbezogener Daten in Prompts
- Der Code wird automatisch fehlerfrei
- Es entstehen keine Lizenzfragen
- Die Hardware wird billiger

? Was bedeutet Bias bei KI?
* Verzerrung durch einseitige Trainingsdaten
- Eine Netzwerkstörung
- Ein Verschlüsselungsverfahren
- Ein Dateiformat

? Wofür ist ein Alternativtext?
* Beschreibung eines Bildes für Screenreader
- Schnellere Ladezeit
- Farbiger Hintergrund
- Verschlüsselung

? Welcher Mindestkontrast wird für normalen Text empfohlen?
* 4,5 : 1
- 1 : 1
- 2 : 1
- 100 : 1

? Wie wird eine RAM-Größe in der Prüfung gerechnet?
* Mit 1024
- Mit 1000
- Mit 8
- Mit 60

? Was zeigt eine Braillezeile?
* Bildschirmtext in Blindenschrift
- Netzwerkverkehr
- Temperaturen
- Videos

? Welches Thema wurde im AP1-Katalog 2025 entfernt?
* RAID-Konfiguration
- Netzplan
- Nutzwertanalyse
- Schreibtischtest

? Was ist bestärkendes Lernen?
* Lernen durch Belohnung und Bestrafung
- Lernen ohne Daten
- Lernen durch Abschreiben
- Lernen mit Etiketten
