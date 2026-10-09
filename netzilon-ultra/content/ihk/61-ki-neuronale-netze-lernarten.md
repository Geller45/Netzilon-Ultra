---
id: ihk-ki-neuronale-netze
bereich: AP1
block: IHK
kapitel: AP1 Katalog 2025
titel: Neuronale Netze, Lernarten und Begriffe der Künstlichen Intelligenz
stufe: Fortgeschritten
fach: PV – AP1
pruefungen: [AP1]
quellen: [AP1_Lernzettel_1.pdf, KI_Software.pdf, Lernzettel_AP1_2024.pdf]
verweise: [ihk-ki-barrierefreiheit, ihk-pruefungsaufbau]
---

## Profi

- **Künstliche Intelligenz (KI)**: Systeme, die Intelligenzleistungen erbringen: Mustererkennung, Verarbeitung natürlicher Sprache, selbstständiges Lernen und Problemlösen.
- **Maschinelles Lernen (ML)**: Teilbereich der KI; Modelle lernen Zusammenhänge aus Daten statt aus festen Regeln.
- **Neuronales Netz (NN)**: Algorithmus, der dem biologischen Gehirn nachempfunden ist: Schichten aus Neuronen (Eingabe-, versteckte (hidden) und Ausgabeschicht) mit gewichteten Verbindungen. Beim Training werden die Gewichte angepasst, bis die Fehler klein sind.
- **Deep Learning / Deep Neural Network**: neuronales Netz mit **vielen versteckten Schichten**.
- **Überwachtes Lernen (Supervised Learning)**: Trainingsdaten sind vorab beschriftet (Label). Mehr Vorarbeit, meist bessere Ergebnisse. Aufgaben: Klassifikation, Vorhersage.
- **Unüberwachtes Lernen (Unsupervised Learning)**: Daten ohne Label; das Netz findet Strukturen, z. B. **Clustering** (Gruppen bilden).
- **Bestärkendes Lernen (Reinforcement Learning)**: Lernen durch Belohnung und Bestrafung.
- **Overfitting (Überanpassung)**: Das Modell hat die Trainingsdaten quasi auswendig gelernt und versagt bei neuen Daten. Gegenmittel: mehr und vielfältigere Daten, Validierungs-/Testdaten, einfachere Modelle, Regularisierung.
- **Schwache KI**: löst enge, definierte Aufgaben und braucht Eingaben des Menschen. **Starke KI**: handelt selbstständig und universell, ohne menschliche Interaktion (bisher theoretisch).
- **Generative KI**: erzeugt Inhalte wie Text, Bild, Ton, Code. **Deepfake**: durch KI manipuliertes oder erzeugtes Bild/Video/Audio, Risiko für Betrug und Desinformation.
- Prüfungsrelevant: Risiken (Halluzination, Bias, Datenschutz, Urheberrecht) und Prüfpflicht der Ergebnisse, siehe Seite „KI, Barrierefreiheit und weitere AP1-Themen 2025“.

## Einfach

Ein neuronales Netz lernt wie ein Kind, Hunde und Katzen zu unterscheiden. Man zeigt ihm tausende Bilder. Bei **überwachtem Lernen** steht auf jedem Bild dran, was es ist („Hund“, „Katze“): wie Lernen mit Lösungsheft. Bei **unüberwachtem Lernen** gibt es kein Lösungsheft; das Netz sortiert nur ähnliche Bilder zu Haufen.

**Overfitting** ist wie Vokabeln, die man nur in genau der Reihenfolge der Lernkarten kann. Sobald die Reihenfolge anders ist, weiß man nichts mehr. Das Netz hat nicht verstanden, sondern auswendig gelernt.

Ein **Deep** Neural Network hat viele Zwischenschichten, wie ein Weg durch viele Räume, in jedem Raum wird das Bild ein bisschen besser verstanden. **Schwache KI** kann genau eine Sache gut (Schach, Sprachassistent). **Starke KI** könnte alles wie ein Mensch, die gibt es noch nicht.

## Merksatz
- Überwacht = mit Label, unüberwacht = Cluster.
- Overfitting = auswendig gelernt.
- Deep = viele Hidden Layer.
- ML ist ein Teil der KI.

## Prüfungsfalle
- Overfitting mit „zu wenig gelernt“ (Underfitting) verwechseln.
- ML und KI gleichsetzen: ML ist nur ein Teilbereich.
- Unüberwacht heißt nicht „ohne Training“, sondern „ohne Labels“.
- KI-Ergebnisse ungeprüft übernehmen.

## Grafik
### Aufbau eines neuronalen Netzes
1. Eingabeschicht: nimmt Daten auf (z. B. Pixel)
2. Hidden Layer: gewichtete Verbindungen verarbeiten die Signale
3. Ausgabeschicht: liefert Ergebnis (z. B. „Hund“)
4. Fehler wird zurückgerechnet und die Gewichte werden angepasst

## Übungen
- A: Ein Netz erkennt Trainingsbilder zu 100 %, neue Bilder nur zu 60 %. Welches Problem? | L: Overfitting
- A: Ein Netz gruppiert Kundendaten ohne Labels. Welche Lernart? | L: Unüberwachtes Lernen (Clustering)

## Lücken
- Ein neuronales Netz mit vielen versteckten Schichten heißt {Deep Learning}.
- Beim {überwachten} Lernen sind die Trainingsdaten beschriftet.
- Zu starke Anpassung an die Trainingsdaten nennt man {Overfitting}.

## Zuordnen
### Begriff zu Erklärung
- Supervised Learning => Daten mit Labels
- Unsupervised Learning => Daten ohne Labels, Clustering
- Reinforcement Learning => Belohnung und Bestrafung
- Deepfake => KI-manipuliertes Bild oder Video

## Spickzettel
- KI > ML > Deep Learning
- Supervised = Label, Unsupervised = Cluster
- Overfitting = auswendig gelernt
- Schwache KI = enge Aufgabe, starke KI = universell
- Ergebnisse immer prüfen

## Karteikarten
- F: Was ist ein neuronales Netz? | A: Algorithmus nach dem Vorbild des Gehirns mit Schichten gewichteter Neuronen
- F: Was ist Deep Learning? | A: Neuronale Netze mit vielen versteckten Schichten
- F: Was ist überwachtes Lernen? | A: Lernen mit vorab beschrifteten Trainingsdaten
- F: Was ist unüberwachtes Lernen? | A: Lernen ohne Labels, z. B. Clustering
- F: Was ist bestärkendes Lernen? | A: Lernen durch Belohnung und Bestrafung
- F: Was ist Overfitting? | A: Das Modell passt sich zu stark an die Trainingsdaten an und versagt bei neuen Daten
- F: Wie ist das Verhältnis von KI und ML? | A: Maschinelles Lernen ist ein Teilbereich der KI
- F: Was ist schwache KI? | A: KI für enge Aufgaben, die menschliche Eingabe braucht
- F: Was ist starke KI? | A: KI, die selbstständig und universell handelt, ohne menschliche Interaktion
- F: Was ist generative KI? | A: KI, die neue Inhalte wie Text, Bild, Ton oder Code erzeugt
- F: Was ist ein Deepfake? | A: Durch KI manipuliertes oder erzeugtes Bild, Video oder Audio

## Quiz
? Was bedeutet Overfitting?
* Das Modell ist zu stark auf die Trainingsdaten angepasst
- Das Modell hat zu wenige Neuronen
- Das Training wurde nie gestartet
- Die Daten sind verschlüsselt

? Was kennzeichnet überwachtes Lernen?
* Beschriftete Trainingsdaten
- Keine Trainingsdaten
- Nur Belohnung und Bestrafung
- Zufällige Gewichte ohne Training

? Welche Lernart bildet Cluster aus unbeschrifteten Daten?
* Unüberwachtes Lernen
- Überwachtes Lernen
- Regelbasiertes Lernen
- Verschlüsseltes Lernen

? Was ist ein Deep Neural Network?
* Ein neuronales Netz mit vielen versteckten Schichten
- Ein Netz mit nur einer Schicht
- Ein Rechenzentrum unter der Erde
- Ein Verschlüsselungsverfahren

? Wie verhalten sich KI und ML zueinander?
* ML ist ein Teilbereich der KI
- KI ist ein Teilbereich von ML
- Sie sind völlig unabhängig
- ML ist nur ein anderer Name für Datenbanken

? Was ist ein Deepfake?
* Ein per KI manipuliertes oder erzeugtes Medium
- Ein Virus in Netzwerken
- Ein verschlüsseltes Backup
- Eine Firewallregel

? Was beschreibt eine schwache KI?
* Eine KI für eng begrenzte Aufgaben, die Eingabe vom Menschen braucht
- Eine KI mit wenig Rechenleistung
- Eine fehlerhafte KI
- Eine KI ohne Training

? Welches Lernverfahren nutzt Belohnung und Bestrafung?
* Bestärkendes Lernen
- Überwachtes Lernen
- Clustering
- Normalisierung
