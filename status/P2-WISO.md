# P2 – WiSo (Agent „WiSo“) – Statusbericht

Ordner: `netzilon-ultra/content/wiso/` – nur die Dateien `30-…` bis `39-…` neu angelegt, nichts anderes geändert, nicht committet.
Kopf je Datei: `bereich: WiSo`, `block: WiSo`, `kapitel: WiSo – IHK-Prüfungstraining`, `fach: WiSo`, `pruefungen: [AP2, WiSo]`, `quellen` (Gesetze + Gratzke/Hauser), `verweise` nur auf existierende ids (bestehende wiso-/ap2-ids + Querverweise innerhalb der neuen p2-Seiten).

## Dateien und Aufgaben

Gezählt mit dem Parser (`tools/lib.js` `ladeParser`/`sammle`). Szenario = Anzahl Blöcke (F/A-Zeilen in Klammern).

| Datei | id | Stufe | MC (davon Mehrfach) | Lücken | Zuordnen | Reihenfolge | Freitext | Szenario (F/A) | Aufgaben | Karten | Legende-Blöcke |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 30-berufsausbildung-bbig.md | wiso-p2-bbig | Einsteiger | 13 (2) | 5 | 2 | 2 | 3 | 2 (7) | 27 | 12 | 3 |
| 31-arbeitsvertrag-kuendigungsschutz.md | wiso-p2-kuendigung | Fortgeschritten | 13 (2) | 5 | 2 | 2 | 3 | 2 (7) | 27 | 12 | 3 |
| 32-arbeitsschutz-schutzgesetze.md | wiso-p2-arbeitsschutz | Fortgeschritten | 13 (2) | 5 | 2 | 2 | 3 | 2 (8) | 27 | 12 | 3 |
| 33-betriebsverfassung-tarifrecht.md | wiso-p2-betriebsverfassung-tarif | Profi | 13 (2) | 5 | 2 | 2 | 3 | 2 (7) | 27 | 12 | 3 |
| 34-sozialversicherung-entgelt.md | wiso-p2-sozialversicherung-entgelt | Fortgeschritten | 13 (2) | 5 | 3 | 2 | 3 | 2 (8) | 28 | 12 | 3 |
| 35-rechtsformen-vollmachten.md | wiso-p2-rechtsformen | Fortgeschritten | 13 (3) | 5 | 2 | 2 | 3 | 2 (7) | 27 | 12 | 3 |
| 36-markt-wirtschaftspolitik.md | wiso-p2-markt-wirtschaftspolitik | Einsteiger | 13 (2) | 5 | 3 | 2 | 3 | 2 (6) | 28 | 12 | 3 |
| 37-vertraege-verbraucherschutz.md | wiso-p2-vertraege-verbraucherschutz | Profi | 13 (2) | 6 | 2 | 2 | 3 | 2 (7) | 28 | 13 | 3 |
| 38-nachhaltigkeit-umwelt-datenschutz.md | wiso-p2-nachhaltigkeit-datenschutz | Einsteiger | 13 (2) | 6 | 3 | 2 | 3 | 2 (8) | 29 | 12 | 4 |
| 39-organisation-kennzahlen.md | wiso-p2-organisation-kennzahlen | Profi | 13 (2) | 6 | 3 | 2 | 3 | 2 (7) | 29 | 12 | 4 |
| **Summe** | | | **130 (21)** | **53** | **24** | **20** | **30** | **20 (72)** | **277** | **121** | **32** |

Soll laut Auftrag: ≥ 200 Aufgaben (Ist 277), ≥ 110 MC (130), ≥ 30 Lücken (53), ≥ 15 Zuordnen (24), ≥ 15 Reihenfolge (20), ≥ 15 Freitext (30), ≥ 15 Szenario (20) – alles erfüllt.

## Qualität
- Jede Datei: Profi, Einfach, Merksatz, Prüfungsfalle, Grafik (2–3 animierbare Abläufe), Legende, Karteikarten (≥ 12), alle sechs Aufgabenarten, Spickzettel; Lab in 34 (Tabelle, GUI), 35 (Handelsregister, GUI), 38 (BitLocker, PowerShell + GUI, Maschine CL01/exa.local), 39 (Break-even, GUI).
- Jede Quizfrage hat eine `! Erklärung` (mit Paragraf, wo sinnvoll); bei Fragen mit einer richtigen Antwort genau 3 falsche.
- `node tools/check-content.js --streng -v`: für `wiso/3*` keine Fehler, Warnungen, Hinweise und keine leeren Verweise; Abschlusszeile `0 Fehler`.
- Beitragssätze werden in 34 nicht als Fakten genannt: Rechenaufgaben nutzen ausdrücklich gekennzeichnete **Beispielwerte**. Feste gesetzliche Werte wie 325 € Geringverdienergrenze und Minijob 603 € (2026) sind genannt.

## Offene Punkte
- Werte, die sich jährlich ändern (Mindestausbildungsvergütung, BBG), sind absichtlich nur als Prinzip bzw. als Beispielwert genannt.
- Rechtsstand 2026 berücksichtigt (BBiG-Novelle 2024 mit Textform, NachwG-Textform 2025, MoPeG/eGbR, Mutterschutz bei Fehlgeburt ab 06/2025, BattDG). Den Widerrufsbutton nach EU-RL 2023/2673 habe ich nicht aufgenommen, weil der Umsetzungsstand unsicher war. Er kann bei einer Aktualisierung ergänzt werden.
- Thematische Überschneidungen mit 01–21 und 90-fragen-* sind gewollt (Prüfungstraining); die Seiten verweisen über `verweise:` aufeinander.
