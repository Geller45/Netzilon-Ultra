# P2 – Speicher-Inhalte (Agent „Speicher-Inhalte“)

Ordner: `netzilon-ultra/content/server/speicher/` (block `SP`, kapitel „Speicher & SAN vertieft“)

## Dateien
| Datei | id | bereich | Karten | Quiz | Lücken | Zuordnen | Reihenfolge | Freitext | Szenario | Legende-Blöcke | Grafiken (animierbar) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 01-das-nas-san.md | server-speicher-das-nas-san | AP1 | 12 | 13 | 3 | 1 | 1 | 1 | 1 (4 Fragen) | 3 | 2 |
| 02-iscsi-vertieft.md | server-speicher-iscsi | AP2 | 13 | 13 | 3 | 1 | 1 | 1 | 1 (4) | 3 | 2 |
| 03-fibre-channel-wwn.md | server-speicher-fibre-channel | AP2 | 12 | 13 | 3 | 1 | 1 | 1 | 1 (4) | 3 | 2 |
| 04-lun-masking-zoning.md | server-speicher-lun-zoning | AP2 | 12 | 13 | 3 | 1 | 1 | 1 | 1 (4) | 2 | 2 |
| 05-multipath-mpio.md | server-speicher-mpio | AP2 | 12 | 13 | 3 | 1 | 1 | 1 | 1 (4) | 2 | 2 |
| 06-raid-vertieft.md | server-speicher-raid | AP1 | 13 | 14 | 3 | 1 | 1 | 1 | 1 (4) | 3 | 2 |
| 07-storage-spaces.md | server-speicher-storage-spaces | AP2 | 13 | 13 | 3 | 1 | 1 | 1 | 1 (4) | 3 | 2 |
| 08-speicherfunktionen.md | server-speicher-funktionen | AP2 | 13 | 13 | 3 | 1 | 1 | 1 | 1 (4) | 3 | 2 |
| 09-speicher-pruefungsfragen.md (typ: fragen) | server-speicher-pruefungsfragen | AP2 | – | 45 | – | – | – | – | – | – | – |
| **Summe** | | | **100** | **150** | **24** | **8** | **8** | **8** | **8** | | |

Aufgaben gesamt (Quiz + Lücken + Zuordnen + Reihenfolge + Freitext + Szenario): **206** (Ziel ≥ 140).
Alle Quizfragen: genau 1 richtige + 3 falsche Antworten, jede mit `! Erklärung`.

## Inhaltliches
- Jede Themenseite: Profi, Einfach, Merksatz, Prüfungsfalle, Grafik (2 animierbare Abläufe), Lab (`### GUI` + `### PowerShell`, Maschinen FS01/HV01/HV02.example.com, ARRAY01, FCSW-A/B, SQL01; Schule `exa.local`; keine Passwörter – CHAP-Geheimnis per `Get-Credential`), Legende, Karteikarten, Quiz, Lücken, Zuordnen, Reihenfolge, Freitext, Szenario.
- Jede Themenseite verweist auf das **Speicher-Labor unter Werkzeuge** (app/speicher.js, anderer Agent).
- RAID-Formeln: RAID 5 (n−1)×C, RAID 6 (n−2)×C, RAID 10 n/2×C, RAID 50 (n−g)×C, RAID 60 (n−2g)×C; Rechenbeispiele in 06, 08 und 09.
- `verweise:` nur auf existierende ids (server-san, server-iscsi, server-raid-uebung, ap1-a2-raid, ap1-a2-backup, az800-datentraeger, az800-storage-spaces, az800-dedup, az801-s2d, az801-failover-cluster, az801-cluster-storage-quorum, az801-cluster-netzwerk, az801-hyperv-replica, ap2-backup-speicher) und die neuen ids untereinander. Bestehende Dateien wurden nicht geändert.

## Prüfung
`node tools/check-content.js --streng -v | grep server/speicher/` → keine Fehler, Warnungen, Hinweise oder „Verweis ins Leere“. Abschlusszeile: `583 Dateien, … 0 Fehler` (die 180 Warnungen stammen aus anderen Ordnern).

## Offene Punkte
- 01–08 liegen bereits im Zwischenstand-Commit 3e8dc46 (vom Orchestrator), 09 ist noch nicht committet. Ich habe selbst nichts committet.
- Überschneidung mit `server-iscsi` (s1-storage/01) ist gewollt: 02 vertieft IQN, Discovery, CHAP und das Netzdesign und verlinkt per `verweise` darauf.
