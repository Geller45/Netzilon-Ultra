# P2 – HV-Szenarien B (26–50) – Statusbericht

Ordner: `netzilon-ultra/content/server/hyperv-szenarien/` (nur 26–50 geschrieben, 01–25 nicht angefasst)
Kopf: `id: server-hvsz-NN`, bereich AZ-800, block HV-S, kapitel Hyper-V-Praxisszenarien; Cluster-/Migrationsthemen zusätzlich AZ-801 (28, 32, 37, 38, 41, 42, 44, 46, 49).

| Datei | Karten | Quiz | Szenario-Fragen | Reihenfolge | Legende-Blöcke |
|---|---|---|---|---|---|
| 26-dc-zeitsync | 9 | 8 | 5 | 1 | 2 |
| 27-autostart | 9 | 8 | 5 | 1 | 2 |
| 28-prozessorkompatibilitaet | 8 | 8 | 5 | – | 1 |
| 29-cpu-ressourcensteuerung | 8 | 8 | 5 | – | 1 |
| 30-numa-sql | 8 | 8 | 5 | – | 2 |
| 31-vtpm-win11 | 9 | 8 | 5 | – | 2 |
| 32-geschuetzte-vms | 9 | 8 | 5 | – | 2 |
| 33-dda-gpu | 8 | 8 | 5 | 1 | 1 |
| 34-bandbreite | 8 | 8 | 5 | – | 2 |
| 35-portspiegelung | 8 | 8 | 5 | – | 1 |
| 36-dhcp-waechter | 8 | 8 | 5 | – | 2 |
| 37-set-team | 8 | 8 | 5 | 1 | 1 |
| 38-konfigurationsversion | 8 | 8 | 5 | – | 1 |
| 39-p2v-disk2vhd | 8 | 8 | 5 | 1 | 2 |
| 40-schulungsraum-sysprep | 8 | 8 | 5 | 1 | 2 |
| 41-cluster-vm-ha | 8 | 8 | 5 | 1 | 2 |
| 42-nested-cluster-iscsi | 9 | 8 | 5 | 1 | 2 |
| 43-lun-optionen | 8 | 8 | 5 | – | 2 |
| 44-gastcluster-vhds | 8 | 8 | 5 | – | 1 |
| 45-optimize-vhd | 8 | 8 | 5 | 1 | 1 |
| 46-windows-server-sicherung | 8 | 8 | 5 | 1 | 2 |
| 47-sandbox-nested | 8 | 8 | 5 | – | 2 |
| 48-remote-arbeitsgruppe | 8 | 8 | 5 | 1 | 2 |
| 49-ereignisprotokolle | 8 | 8 | 5 | – | 2 |
| 50-abschluss-nested-lab | 9 | 8 | 6 | 1 | 2 |
| **Summe** | **206** | **200** | **126** | **12** | |

Jede Datei: Profi (Ticket/Ausgangslage/Analyse/Lösungsweg/Ergebnis prüfen/Vorbeugung), Einfach, Merksatz, Prüfungsfalle, 1 animierbare Grafik, Lab (Nachstellen: GUI mit Maschine fett + PowerShell-Codeblock mit `# Auf <Maschine>`), Szenario/Kontrollfragen, Legende, ≥ 8 Karten, 8 Quizfragen (je 1 richtig, 3 falsch, Erklärung). Verweise geprüft (alle ids existieren).

Prüfung: `node tools/check-content.js --streng -v` → keine Fehler/Warnungen/Hinweise für 26–50; Gesamt `0 Fehler`.

## Offene Punkte / Hinweise
- Labs mit Spezialhardware (28 CPU-Generationen, 33 DDA-GPU) sind ohne passende Hardware nur als Konfigurationsübung nachstellbar – im Text vermerkt.
- 32 (Shielded VMs/HGS) bewusst nur als Überblick; Lab setzt nur die lokale Schutzstufe (vTPM, lokaler Key Protector, verschlüsselter Zustand) um.
- Beispielversion in 46 (`wbadmin … -version:10/09/2026-21:00`) ist ein Platzhalter; Format ist gebietsschemaabhängig (Hinweis im Code).
- Nicht committet.
