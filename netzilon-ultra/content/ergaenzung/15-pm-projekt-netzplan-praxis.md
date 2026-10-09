---
id: erg-projekt-netzplan-praxis
bereich: AP2
block: ERG
kapitel: Ergänzungen 2.2
titel: IT-Projekte steuern – Phasen, Netzplan mit Puffern, Gantt, Risiken und Projektabschluss
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [DIN 69900 (Netzplantechnik), DIN 69901 (Projektmanagement), IHK-Prüfungsaufgaben Netzplan und Projektplanung]
verweise: [ap2-projektmanagement, ihk-netzplan, ihk-requirements-vorgehensmodelle, server-pv-projektmanagement-grundlagen, server-pv-projektphasen-lastenheft-pflichtenheft, server-pv-stakeholder-risiko-nutzwertanalyse, server-pv-uebergabe-abnahme-leistungsbewertung]
---

## Profi

### Projekt und magisches Dreieck
Ein **Projekt** ist einmalig, zeitlich begrenzt, hat ein definiertes Ziel, begrenzte Ressourcen und eine eigene Organisation (DIN 69901). Die Ziele stehen im **magischen Dreieck** aus **Leistung/Qualität**, **Zeit** und **Kosten** – wer eine Ecke verändert, beeinflusst die anderen. Ziele werden **SMART** formuliert (spezifisch, messbar, attraktiv/akzeptiert, realistisch, terminiert).

### Phasen (klassisch)
**Initialisierung** (Projektauftrag, Ziele, Lastenheft des Auftraggebers) → **Definition** (Pflichtenheft des Auftragnehmers, Stakeholder-, Risiko-, Machbarkeitsanalyse) → **Planung** (Projektstrukturplan PSP mit Arbeitspaketen, Ablauf-/Terminplan, Ressourcen, Kosten) → **Durchführung** mit **Steuerung/Controlling** (Soll-Ist-Vergleich, Meilensteine, Statusberichte, Änderungsmanagement) → **Abschluss** (Abnahme mit Abnahmeprotokoll, Dokumentation, Übergabe, Lessons Learned). Agile Alternative: **Scrum** mit Sprints, Product Backlog, Daily Scrum, Review, Retrospektive.

### Netzplan (Vorgangsknotennetz)
Jeder Knoten enthält Nr., Bezeichnung, **Dauer (D)**, **FAZ/FEZ** (frühester Anfangs-/Endzeitpunkt), **SAZ/SEZ** (spätester Anfangs-/Endzeitpunkt), **GP** (Gesamtpuffer) und **FP** (freier Puffer).
- **Vorwärtsrechnung**: FAZ des Startvorgangs = 0; FEZ = FAZ + D; FAZ eines Nachfolgers = **größter** FEZ aller Vorgänger.
- **Rückwärtsrechnung**: SEZ des letzten Vorgangs = sein FEZ; SAZ = SEZ − D; SEZ eines Vorgängers = **kleinster** SAZ aller Nachfolger.
- **Gesamtpuffer** GP = SAZ − FAZ (= SEZ − FEZ): Verschiebung ohne Gefährdung des Projektendes.
- **Freier Puffer** FP = kleinster FAZ der Nachfolger − FEZ: Verschiebung ohne Auswirkung auf Nachfolger.
- **Kritischer Pfad**: alle Vorgänge mit **GP = 0** – jede Verzögerung verschiebt das Projektende.

**Beispiel** (Dauer in Tagen):
| Nr. | Vorgang | D | Vorgänger | FAZ | FEZ | SAZ | SEZ | GP | FP |
|---|---|---|---|---|---|---|---|---|---|
| A | Anforderungen klären | 2 | – | 0 | 2 | 0 | 2 | 0 | 0 |
| B | Hardware beschaffen | 5 | A | 2 | 7 | 2 | 7 | 0 | 0 |
| C | Server vorbereiten | 3 | A | 2 | 5 | 4 | 7 | 2 | 0 |
| D | Installation | 4 | B, C | 7 | 11 | 7 | 11 | 0 | 0 |
| E | Schulung | 2 | C | 5 | 7 | 9 | 11 | 4 | 4 |
| F | Abnahme | 1 | D, E | 11 | 12 | 11 | 12 | 0 | 0 |
Projektdauer **12 Tage**, kritischer Pfad **A – B – D – F**.

### Gantt-Diagramm und Meilensteine
Das **Gantt-Diagramm** (Balkenplan) zeigt Vorgänge als Balken auf einer Zeitachse, Abhängigkeiten als Pfeile und **Meilensteine** (Dauer 0, Rauten) als Prüfpunkte. Es eignet sich zur Kommunikation und Fortschrittskontrolle, der Netzplan zur Berechnung von Puffern.

### Risikomanagement
Risiken **identifizieren** → **bewerten** (Eintrittswahrscheinlichkeit × Schadenshöhe = Risikowert, Risikomatrix) → **Maßnahmen** (vermeiden, vermindern, übertragen z. B. Versicherung/Vertrag, akzeptieren) → **überwachen**.

## Einfach
Ein Projekt ist wie eine **Geburtstagsparty planen**: Es passiert einmal, hat ein festes Datum und ein Budget. Wenn du mehr Gäste willst (Leistung), brauchst du mehr Geld oder mehr Zeit. Das ist das **magische Dreieck**.

Zuerst schreibst du auf, was du willst (**Lastenheft**: „Party mit Musik und Kuchen für 20 Kinder“). Dann plant jemand, wie es geht (**Pflichtenheft**: „Wir mieten Boxen, backen zwei Kuchen …“).

Manche Aufgaben hängen voneinander ab: Kuchen backen geht erst, wenn die Zutaten gekauft sind. Andere laufen gleichzeitig: Während der Kuchen backt, kannst du dekorieren. Im **Netzplan** malst du jede Aufgabe als Kästchen und verbindest sie mit Pfeilen. Dann rechnest du: Wann kann jede Aufgabe frühestens fertig sein? Die längste Kette von Aufgaben, die hintereinander erledigt werden müssen, ist der **kritische Pfad**. Wenn da etwas zu spät ist, verschiebt sich die ganze Party.

Aufgaben, die nicht auf dem kritischen Pfad liegen, haben **Puffer** – Zeit, die sie sich verspäten dürfen, ohne dass die Party später anfängt. Das Dekorieren darf vielleicht zwei Stunden später starten, das Kuchenbacken nicht.

Am Ende fragst du deine Gäste: „War alles so, wie bestellt?“ Und lässt es dir unterschreiben – das ist die **Abnahme**. Danach überlegst du, was du nächstes Mal besser machst.

## Merksatz
- **Vorwärts das Maximum, rückwärts das Minimum.**
- **GP = SAZ − FAZ; FP = min. FAZ der Nachfolger − FEZ.**
- **Kritischer Pfad = GP 0.**
- **Lastenheft = WAS (Auftraggeber), Pflichtenheft = WIE (Auftragnehmer).**
- **Risiko = Wahrscheinlichkeit × Schaden.**

## Prüfungsfalle
- Bei mehreren Vorgängern in der Vorwärtsrechnung den **größten** FEZ nehmen, nicht den kleinsten.
- Bei der Rückwärtsrechnung bei mehreren Nachfolgern den **kleinsten** SAZ nehmen.
- **Gesamtpuffer ≠ freier Puffer** – ein Vorgang kann GP > 0, aber FP = 0 haben (Vorgang C im Beispiel).
- Es kann **mehrere kritische Pfade** geben.
- Das Pflichtenheft schreibt der **Auftragnehmer**, nicht der Kunde.

## Grafik
### Netzplan vorwärts und rückwärts
1. A: FAZ 0, FEZ 2
2. A -> B, C: Nachfolger starten frühestens bei 2
3. B, C -> D: FAZ D = max(7, 5) = 7
4. D, E -> F: FAZ F = max(11, 7) = 11, Projektende 12
5. F -> D, E: Rückwärts SEZ D = 11, SEZ E = 11
6. D, E -> C: SEZ C = min(7, 9) = 7 – Gesamtpuffer C = 2
7. A: Kritischer Pfad A – B – D – F

### Projektphasen
1. Auftraggeber -> Projektleitung: Projektauftrag und Lastenheft
2. Projektleitung -> Auftraggeber: Pflichtenheft
3. Projektteam: Planung mit PSP, Netzplan, Gantt
4. Projektteam: Durchführung mit Soll-Ist-Vergleich
5. Projektleitung -> Auftraggeber: Abnahme und Übergabe
6. Projektteam: Lessons Learned

## Lab
**Maschine**: Arbeitsplatz **CL01** (Windows 11) mit Tabellenkalkulation oder dem Netzplan-Rechner der App.

### GUI
1. **CL01**: Vorgangsliste (Nr., Dauer, Vorgänger) aus dem Beispiel in eine Tabelle übertragen.
2. **CL01**: Spalten FAZ/FEZ mit Formeln vorwärts berechnen (FEZ = FAZ + D; FAZ = MAX der FEZ der Vorgänger).
3. **CL01**: Spalten SAZ/SEZ rückwärts berechnen (SAZ = SEZ − D; SEZ = MIN der SAZ der Nachfolger).
4. **CL01**: GP = SAZ − FAZ berechnen und Vorgänge mit GP = 0 farbig markieren.
5. **CL01**: Ergebnis mit dem Netzplan-Rechner der App vergleichen.

### PowerShell
```powershell
# CL01 – Vorwärtsrechnung des Beispiels
$v = [ordered]@{ A=@{D=2;V=@()}; B=@{D=5;V=@('A')}; C=@{D=3;V=@('A')}; D=@{D=4;V=@('B','C')}; E=@{D=2;V=@('C')}; F=@{D=1;V=@('D','E')} }
$fez = @{}
foreach ($k in $v.Keys) {
    $faz = 0
    foreach ($p in $v[$k].V) { if ($fez[$p] -gt $faz) { $faz = $fez[$p] } }
    $fez[$k] = $faz + $v[$k].D
    '{0}: FAZ {1}, FEZ {2}' -f $k, $faz, $fez[$k]
}
```

## Legende
### Kritischer Pfad
- Was: Kette von Vorgängen ohne Gesamtpuffer, die die Projektdauer bestimmt.
- Wie: Nach Vorwärts- und Rückwärtsrechnung alle Vorgänge mit GP = 0 verbinden.
- Wann: Bei der Terminplanung und bei jeder Verzögerung im Projekt.
- Wo: Im Netzplan, oft auch im Gantt-Diagramm hervorgehoben.
- Warum: Zeigt, wo Ressourcen und Aufmerksamkeit zuerst hingehören.

### Gesamtpuffer
- Was: Zeit, um die ein Vorgang verschoben werden kann, ohne das Projektende zu gefährden.
- Wie: GP = SAZ − FAZ bzw. SEZ − FEZ.
- Wann: Bei der Ressourcenplanung und bei Verzögerungen.
- Wo: Im Knoten des Vorgangsknotennetzes.
- Warum: Ermöglicht flexible Planung von Vorgängen außerhalb des kritischen Pfades.

## Karteikarten
- F: Nennen Sie die Merkmale eines Projekts nach DIN 69901. | A: Einmaligkeit, zeitliche Begrenzung, klare Zielvorgabe, begrenzte Ressourcen, eigene Projektorganisation.
- F: Was ist das magische Dreieck? | A: Zusammenhang von Leistung/Qualität, Zeit und Kosten – Änderungen an einer Größe beeinflussen die anderen.
- F: Wer erstellt Lasten- und Pflichtenheft? | A: Lastenheft der Auftraggeber (WAS), Pflichtenheft der Auftragnehmer (WIE).
- F: Wie berechnet man den FAZ bei mehreren Vorgängern? | A: Größter FEZ aller Vorgänger.
- F: Wie berechnet man den SEZ bei mehreren Nachfolgern? | A: Kleinster SAZ aller Nachfolger.
- F: Formel Gesamtpuffer? | A: GP = SAZ − FAZ (oder SEZ − FEZ).
- F: Formel freier Puffer? | A: FP = kleinster FAZ der Nachfolger − eigener FEZ.
- F: Was ist der kritische Pfad? | A: Die Folge von Vorgängen mit Gesamtpuffer 0; sie bestimmt die Projektdauer.
- F: Was ist ein Meilenstein? | A: Ein Ereignis ohne Dauer, an dem ein wichtiges Zwischenergebnis überprüft wird.
- F: Nennen Sie vier Strategien im Risikomanagement. | A: Vermeiden, vermindern, übertragen, akzeptieren.

## Quiz
? Wie wird der FAZ eines Vorgangs mit mehreren Vorgängern bestimmt?
* Größter FEZ aller Vorgänger
- Kleinster FEZ aller Vorgänger
- Summe der Dauern der Vorgänger
- Durchschnitt der FEZ
! Ein Vorgang kann erst starten, wenn alle Vorgänger fertig sind.

? Welche Vorgänge liegen auf dem kritischen Pfad?
* Vorgänge mit Gesamtpuffer 0
- Vorgänge mit der längsten Einzeldauer
- Vorgänge mit freiem Puffer größer 0
- Alle Vorgänge der Durchführungsphase
! Jede Verzögerung dieser Vorgänge verschiebt das Projektende.

? Im Beispiel hat Vorgang E (Schulung) einen Gesamtpuffer von …
* 4 Tagen
- 0 Tagen
- 2 Tagen
- 7 Tagen
! SAZ 9 − FAZ 5 = 4.

? Wer erstellt das Pflichtenheft?
* Der Auftragnehmer
- Der Auftraggeber
- Der Betriebsrat
- Die IHK
! Es beschreibt, wie die Anforderungen des Lastenhefts umgesetzt werden.

? Wie berechnet sich der Gesamtpuffer?
* SAZ − FAZ
- FEZ − FAZ
- SEZ − SAZ
- FAZ + Dauer
! Gleichwertig: SEZ − FEZ.

? Welche Darstellung zeigt Vorgänge als Balken auf einer Zeitachse?
* Gantt-Diagramm
- Netzplan
- Projektstrukturplan
- Risikomatrix
! Der PSP gliedert dagegen Arbeitspakete hierarchisch.

? Ein Risiko wird durch Abschluss einer Versicherung behandelt. Welche Strategie ist das?
* Übertragen
- Vermeiden
- Vermindern
- Akzeptieren
! Die finanziellen Folgen tragen Dritte.

? Was bedeutet das „M“ in SMART?
* Messbar
- Machbar
- Modern
- Minimal
! Spezifisch, messbar, attraktiv/akzeptiert, realistisch, terminiert.

? Wann ist ein Projekt formal abgeschlossen?
* Nach Abnahme, Übergabe, Dokumentation und Abschlussbericht
- Sobald die Hardware geliefert ist
- Wenn das Budget verbraucht ist
- Nach dem ersten Statusbericht
! Die Abnahme wird mit einem Abnahmeprotokoll dokumentiert.

## Lücken
- Der kritische Pfad besteht aus Vorgängen mit einem Gesamtpuffer von {0}.
- In der Vorwärtsrechnung gilt bei mehreren Vorgängern der {größte} FEZ.
- Das {Lastenheft} beschreibt die Anforderungen des Auftraggebers.
- Der Gesamtpuffer berechnet sich aus SAZ minus {FAZ}.
- Leistung, Zeit und Kosten bilden das {magische Dreieck}.

## Zuordnen
### Begriff und Bedeutung
- FAZ => frühester Anfangszeitpunkt
- SEZ => spätester Endzeitpunkt
- GP => Gesamtpuffer
- FP => freier Puffer

### Dokument und Ersteller/Zweck
- Lastenheft => Auftraggeber – Anforderungen (WAS)
- Pflichtenheft => Auftragnehmer – Umsetzung (WIE)
- Abnahmeprotokoll => Bestätigung der vertragsgemäßen Leistung
- Projektstrukturplan => Gliederung in Teilaufgaben und Arbeitspakete

### Risikostrategie und Beispiel
- Vermeiden => riskante Technik nicht einsetzen
- Vermindern => Testumgebung und Pilotphase
- Übertragen => Versicherung oder Vertragsstrafe beim Lieferanten
- Akzeptieren => geringes Risiko bewusst tragen

## Reihenfolge
### Projektphasen (klassisch)
1. Initialisierung
2. Definition
3. Planung
4. Durchführung und Steuerung
5. Abschluss

### Netzplan berechnen
1. Vorgangsliste mit Dauern und Abhängigkeiten aufstellen
2. Netzplan zeichnen
3. Vorwärtsrechnung (FAZ, FEZ)
4. Rückwärtsrechnung (SAZ, SEZ)
5. Puffer berechnen
6. Kritischen Pfad markieren

### Risikomanagement
1. Risiken identifizieren
2. Eintrittswahrscheinlichkeit und Schaden bewerten
3. Risiken priorisieren (Risikomatrix)
4. Maßnahmen festlegen
5. Risiken laufend überwachen

## Freitext
- F: Erläutern Sie den Unterschied zwischen Gesamtpuffer und freiem Puffer am Vorgang C des Beispiels. | M: C: GP = SAZ 4 − FAZ 2 = 2 Tage – das Projektende ist erst nach mehr als 2 Tagen Verzug gefährdet. FP = min(FAZ D 7, FAZ E 5) − FEZ 5 = 0 – jeder Verzug verschiebt Nachfolger E. | P: 4
- F: Nennen Sie vier Inhalte eines Pflichtenhefts. | M: Ausgangssituation, Ziele, Umsetzung der Anforderungen (Lösungskonzept), technische Spezifikation, Abnahmekriterien, Termine/Meilensteine, Kosten, Abgrenzung (Nicht-Ziele). | P: 4
- F: Beschreiben Sie, wie Sie auf eine Verzögerung eines Vorgangs auf dem kritischen Pfad reagieren können. | M: Ursachen analysieren, Ressourcen erhöhen (Überstunden, zusätzliches Personal), Vorgänge parallelisieren, Umfang reduzieren (mit Auftraggeber abstimmen), Puffer anderer Vorgänge nutzen, Termin neu planen und kommunizieren. | P: 4

## Szenario
### Rollout von 50 Arbeitsplätzen
Für den Rollout gelten: A Bestandsaufnahme 3 Tage; B Hardware bestellen 10 Tage (nach A); C Image erstellen 4 Tage (nach A); D Pilotinstallation 2 Tage (nach C); E Rollout 5 Tage (nach B und D); F Abnahme 1 Tag (nach E).
- F: Berechnen Sie die Projektdauer. | A: A 0–3; B 3–13; C 3–7; D 7–9; E FAZ max(13, 9) = 13, FEZ 18; F 18–19 → 19 Tage. | P: 4
- F: Welche Vorgänge liegen auf dem kritischen Pfad und welchen Gesamtpuffer hat D? | A: A – B – E – F; D: SEZ 13, SAZ 11, FAZ 7 → GP 4 Tage (C ebenfalls 4). | P: 4

### Lieferant meldet Verzögerung
Der Lieferant meldet, dass die Server (Vorgang „Hardware beschaffen“, kritischer Pfad) 3 Tage später kommen.
- F: Welche Auswirkung hat das? | A: Das Projektende verschiebt sich um 3 Tage, da der Vorgang keinen Puffer hat. | P: 2
- F: Nennen Sie zwei Gegenmaßnahmen. | A: Alternative Lieferanten/Leihgeräte, nachfolgende Vorgänge beschleunigen (Zusatzpersonal), Vorarbeiten parallel erledigen, Termin mit Auftraggeber neu abstimmen. | P: 2

### Risikobewertung
Im Projekt „Umzug des Serverraums“ wurden Risiken bewertet (Wahrscheinlichkeit 1–5, Schaden 1–5): Stromausfall beim Umzug (2/5), Kabel fehlen (4/2), Datenverlust durch Transportschaden (1/5).
- F: Berechnen Sie die Risikowerte und priorisieren Sie. | A: Stromausfall 10, Kabel 8, Datenverlust 5 → Reihenfolge Stromausfall, Kabel, Datenverlust. | P: 3
- F: Schlagen Sie für den Datenverlust eine Maßnahme vor. | A: Vollständige, geprüfte Datensicherung vor dem Umzug (vermindern) und Transportversicherung (übertragen). | P: 2
