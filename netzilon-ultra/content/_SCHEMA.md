# Netzilon – Inhaltsformat (Version 1)

Jede Themen-Datei = eine Markdown-Datei. Die App liest sie beim Build automatisch ein.

## Kopf (Pflicht)
```
---
id: ap1-a1-mainboard          # eindeutig, klein, Bindestriche
bereich: AP1                   # AP1 | AP2 | AZ-800 | AZ-801 | Legacy | Prüfung | Referenz
block: A1
kapitel: Hardware
titel: Mainboard
stufe: Einsteiger              # Einsteiger | Fortgeschritten | Profi
quellen: [02_Übung_Mainboard.pdf]
verweise: [ap1-a1-chipsatz]    # Querverweise auf andere ids
---
```

## Abschnitte (feste Überschriften, genau so geschrieben)
| Überschrift | Inhalt |
|---|---|
| `## Profi` | Fachlich vollständige Theorie (mind. 1 Seite) |
| `## Einfach` | Erklärung wie für 10-Jährige, beim ersten Lesen verständlich (mind. 1 Seite) |
| `## Merksatz` | Eselsbrücken, je Zeile eine |
| `## Prüfungsfalle` | Typische Fehler/Fallen in der Prüfung |
| `## Grafik` | Beschreibung der Animation(en): `### Name` + Ablauf in Schritten |
| `## Lab` | Optional: Praxis, `### GUI` und `### PowerShell`, Maschine immer angeben |
| `## Befehle` | Optional: `` `Befehl` `` – Erklärung |
| `## Übungen` | Optional: Aufgaben aus den Unterlagen mit Lösung, Format wie Karteikarten: `- A: Aufgabe`, senkrechter Strich, `L: Lösung` |
| `## Karteikarten` | `- F: Frage \| A: Antwort` |
| `## Quiz` | `? Frage` gefolgt von `* richtig` und `- falsch` (3 falsche) |

## Regeln
- Sprache: Deutsch, Fachbegriffe mit englischem Original in Klammern
- Stand: Server 2022/2025, Windows 11; Veraltetes als „Legacy“ markieren
- Tabellen in Markdown erlaubt
- In Karteikarten/Übungen trennt ` | ` Frage und Antwort; ein senkrechter Strich **innerhalb** des Textes (z. B. PowerShell-Pipeline) wird als `\|` geschrieben

## Erweiterungen (Version 1.1, ab A12/A13)
- `bereich: Legacy` = Legacy-Box (veraltete Technik, mit Stand-Hinweis anzeigen).
- `bereich: Prüfung` = Prüfungsfragen und Übungsaufgaben, `bereich: Referenz` = Befehls- und Portreferenzen.
- Optionales Kopffeld `typ:` mit den Werten `fragen` (nur `## Quiz`), `uebung` (Profi/Einfach/Merksatz/Prüfungsfalle/Grafik/Übungen/Quiz) oder `referenz` (Vollformat inkl. `## Befehle`). Ohne `typ` gilt das normale Themenformat.
- Im `## Quiz` darf nach den Antworten **eine** Zeile `! Erklärung` stehen; sie wird nach dem Beantworten angezeigt. Die Reihenfolge der Antworten kann die App mischen (die richtige ist mit `*` markiert).
- `## Übungen`: `- A: Aufgabe | L: Lösung` (ein senkrechter Strich im Text als `\|`).
