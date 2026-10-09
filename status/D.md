# Status Agent D (Anomalie-Prüfer)

## Checks
- check-content --strict: 0 Fehler (vorher und nachher); Warnungen 607 -> 599 (restlich: 4 falsche statt 3 = Mehrfachauswahl/Pool, Ja/Nein-Serien mit 1 falsch, <8 Karten/Quiz, Einfach/Profi kurz).
- build-html + test-ui: bestanden (Netzilon-Ultra.html 3.02 MB, 527 Dateien).

## Korrekturen
- Tote Verweise behoben (8): netz-ethernet-frame-mac -> netz-ethernet-csma-cd-frame; netz-netzarten-standards -> netz-datenuebertragung-switching; db-relationen -> db-er-modell; netz-routing-pruefungsaufgabe entfernt (3 Dateien).
- server/s4-pv (14 Dateien, 166 Fragen): alle Distraktoren neu geschrieben (vorher aus anderen Antworten automatisch gebildet, teils wahr/unplausibel).
- ihk/50-54 (7 Dateien, 140 Fragen): gleiches Problem (Distraktoren teils ebenfalls richtig, z. B. Check-Phase), alle neu; mehrdeutige Optionen nachgeschärft.
- Inhaltsfehler: ihk/51 Teil2 "Was ist ein Gateway?" hatte Modem-Antwort -> korrigiert (Profi, Karten, Quiz); Tippfehler "AT"->NAT, "in /24", "m Lastenheft", "Q: SAN".

## DP-203
- Quellen-Nummern 1-370: alle 370 in content/pruefung/dp203 vorhanden (Quiz + "### DP-203 Frage N"-Drag&Drop-Abschnitte). Keine Lücken. Status-B "348" = nur Quiz-Nummern; 22 Nummern (122,123,162,166-168,186,191,193,194,200,265,322,336,358-360,362,363,365-367) stehen als Drag&Drop/Hotspot-Abschnitte bzw. in Teilfragen.
- 416 Quizfragen (Mehrfach-Teilfragen je Nummer); 74 doppelte Frage-Texte (Serienfragen, bewusst).

## Offen
- s4-pv Q "offener Mangel binnen 2 Wochen" und "Aufbewahrung 10 Jahre" sind Quelle-Aussagen; rechtlich ungenau (HGB: unverzüglich; seit 2025 Buchungsbelege 8 Jahre).
- Weitere Stichproben (linux, ccna, wiso, lpic, dp203, az800, azure-data) fachlich ok, handgeschrieben.
- 599 Warnungen (Kartenanzahl/Quizanzahl) nicht aufgefüllt.
