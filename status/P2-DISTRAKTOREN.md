# P2 – Distraktoren-Überarbeitung (Antwortlängen-Bias)

Umfang: nur `## Quiz` in `content/wiso/3[0-9]-*.md`, `content/server/hyperv/`, `content/server/hyperv-szenarien/`, `content/server/speicher/`.
Messung: Einzelwahl-Fragen, Anteil „richtige Antwort = längste Antwort“ (Zeichen), sowie Anzahl „richtig > 1,3 × längste falsche“.
Skript: `scratchpad/messe.js` (nutzt `tools/lib.js` → `ladeParser()`, `sammle()`).

| Ordner | Einzelwahl | vorher richtig=längste | nachher richtig=längste | vorher > 1,3× | nachher > 1,3× | geänderte Fragen |
|---|---:|---:|---:|---:|---:|---:|
| wiso (30–39) | 109 | 52 (47,7 %) | 30 (27,5 %) | 34 | 0 | 34 |
| hyperv | 148 | 102 (68,9 %) | 42 (28,4 %) | 65 | 0 | 88 |
| hyperv-szenarien | 401 | 229 (57,1 %) | 138 (34,4 %) | 145 | 0 | 149 |
| speicher | 150 | 64 (42,7 %) | 40 (26,7 %) | 47 | 0 | 47 |
| **Summe** | 808 | 447 | 250 | 291 | 0 | **318** |

## Vorgehen
- Distraktoren auf ähnliche Länge ausgebaut: typische Verwechslungen (z. B. Zutritts- statt Zugriffskontrolle, WWNN statt WWPN, LUN-Masking vs. Zoning, § 622 Abs. 2 BGB für AN-Kündigung), echte Cmdlets/Parameter mit falscher Zuordnung (Set-VMSwitch statt Set-VMHost für MAC-Pool, Remove-VMSnapshot statt Restore-VMSnapshot, -PortMirroring Off statt None, Import-VM -Register/-VhdDestinationPath).
- Richtige Antworten wo möglich gestrafft; dabei entfallene Details in die Erklärung (`!`) verschoben.
- Zahlen-/Enum-Antworten vereinheitlicht (z. B. „22,0 TB“, „Set-VM -CheckpointType …“, „Optimize-VHD -Mode …“).
- Weiterhin genau eine richtige Antwort je Einzelwahl-Frage; Erklärungen bei Bedarf ergänzt (z. B. warum der neue Distraktor falsch ist).

## Prüfung
`node tools/check-content.js` → 0 Fehler, 0 Warnungen. Nicht committet.
