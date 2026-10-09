# P2 – Agent „Hyper-V“ – Statusbericht

Ordner: `netzilon-ultra/content/server/hyperv/` (nur dort geschrieben, bestehende `content/az800/d3-vms/` unverändert, per `verweise:` verlinkt).
Kopf überall: `bereich: AZ-800`, `block: HV`, `kapitel: Hyper-V vertieft`, `fach: Windows Server / AZ-800`, `pruefungen: [AZ-800, AP2, Schule]`.

## Dateien

| Datei | id | Karten | MC-Quiz | Lücken | Zuordnen | Reihenfolge | Freitext | Szenario (Fragen) | Legende-Blöcke | Grafiken (animierbar) |
|---|---|---|---|---|---|---|---|---|---|---|
| 01-nested-grundlagen.md | server-hyperv-nested-grundlagen | 12 | 13 | 3 | 1 | 1 | 2 | 1 (4) | 2 | 2 |
| 02-nested-netzwerk.md | server-hyperv-nested-netzwerk | 12 | 12 | 3 | 1 | 1 | 2 | 1 (4) | 2 | 3 |
| 03-nested-speicher-ram-einschraenkungen.md | server-hyperv-nested-einschraenkungen | 12 | 13 | 3 | 1 | 1 | 2 | 1 (4) | 2 | 2 |
| 04-generation-1-vs-2.md | server-hyperv-generationen | 12 | 13 | 3 | 1 | 1 | 2 | 1 (5) | 2 | 2 |
| 05-pruefpunkte-vertieft.md | server-hyperv-pruefpunkte-vertieft | 13 | 13 | 3 | 1 | 1 | 2 | 1 (4) | 2 | 2 |
| 06-dynamic-memory-ressourcen.md | server-hyperv-dynamic-memory | 12 | 12 | 3 | 1 | 1 | 2 | 1 (4) | 3 | 2 |
| 07-vswitch-vlan-sicherheit.md | server-hyperv-vswitch-vlan | 12 | 12 | 3 | 1 | 1 | 2 | 1 (4) | 3 | 2 |
| 08-nested-lab-aufbau.md | server-hyperv-nested-lab | 12 | 13 | 3 | 1 | 1 | 2 | 1 (4) | 2 | 2 |
| 09-hyperv-pruefungsfragen.md (`typ: fragen`) | server-hyperv-pruefungsfragen | – | 47 | – | – | – | – | – | – | – |
| **Summe** | | **97** | **148** | **24** | **8** | **8** | **16** | **8** | | |

Aufgaben gesamt (Checker-Zählweise: Quiz + Lücken + Zuordnen + Reihenfolge + Freitext + Szenarien): **212** (Ziel ≥ 140).
Alle Quizfragen: genau 1 richtige + 3 falsche Antworten, jede mit `! Erklärung`. Jede Themenseite hat Profi, Einfach, Merksatz, Prüfungsfalle, Grafik, Lab (`### GUI` + `### PowerShell`, Maschinen benannt: HV01.example.com, HV-NESTED, INNER01, HVN1/HVN2, ISCSI01, DC01 …), Legende, Spickzettel.

## Prüfung
`node tools/check-content.js --streng -v` → keine Fehler, Warnungen, Hinweise oder „Verweis ins Leere“ für `server/hyperv/`; Gesamtlauf 0 Fehler.

## Offene Punkte / fachliche Hinweise
- AMD-Nested: Microsoft-Doku nennt für AMD Konfigurationsversion 9.3+; im Text als „laut Doku ≥ 9.3, Prüfungsregel ≥ 8.0“ formuliert.
- Prüfpunkte/Save State der äußeren Nested-VM: vorsichtig formuliert („gilt als nicht unterstützt bzw. scheitert; sicher: herunterfahren“), da die Doku hier je Version unterschiedlich detailliert ist.
- Azure-VM-Größen mit Nested-Unterstützung nur beispielhaft (Dv3/Dv4/Dv5, Ev3+), keine vollständige Liste.
- Nicht committet.
