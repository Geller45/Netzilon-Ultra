# P2-HVSZ-A – Hyper-V-Praxisszenarien 01–25

Ordner: `netzilon-ultra/content/server/hyperv-szenarien/` (nur Dateien 01–25; 26–50 von anderem Agenten, nicht angefasst).
Kopf: id `server-hvsz-NN`, bereich AZ-800, block HV-S, kapitel Hyper-V-Praxisszenarien, fach Windows Server / AZ-800, pruefungen [AZ-800, AP2, Schule], quellen [Microsoft Learn – Hyper-V].
Aufbau je Datei: Profi (Ticket, Ausgangslage, Analyse, Lösungsweg, Ergebnis prüfen, Vorbeugung), Einfach, Merksatz, Prüfungsfalle, Grafik (1 animierbar), Lab (Fehler erzeugen → beheben; GUI + PowerShell, Maschine fett), Szenario „Kontrollfragen“ (5 F/A), Reihenfolge (24 von 25 Dateien), Legende, Karteikarten, Quiz (je genau 1 richtig + 3 falsch + Erklärung).

## Dateien
| Datei | id | Stufe | Karten | Quiz | Szenario-Fragen | Reihenfolge | Lab-Schritte |
|---|---|---|---|---|---|---|---|
| 01-ram-start.md | server-hvsz-01 | Einsteiger | 9 | 9 | 5 | 1 | 11 |
| 02-nested-netz.md | server-hvsz-02 | Fortgeschritten | 9 | 8 | 5 | 1 | 9 |
| 03-nested-rolle.md | server-hvsz-03 | Einsteiger | 9 | 8 | 5 | 1 | 10 |
| 04-nested-azure-nat.md | server-hvsz-04 | Profi | 9 | 8 | 5 | 1 | 10 |
| 05-gen1-zu-gen2.md | server-hvsz-05 | Profi | 9 | 8 | 5 | 1 | 11 |
| 06-linux-secureboot.md | server-hvsz-06 | Einsteiger | 9 | 8 | 5 | 1 | 11 |
| 07-avhdx-kette.md | server-hvsz-07 | Fortgeschritten | 9 | 8 | 5 | 1 | 10 |
| 08-produktionspruefpunkt.md | server-hvsz-08 | Fortgeschritten | 9 | 8 | 5 | 1 | 10 |
| 09-dc-pruefpunkt.md | server-hvsz-09 | Profi | 9 | 8 | 5 | 1 | 10 |
| 10-dynamic-memory-max.md | server-hvsz-10 | Fortgeschritten | 9 | 8 | 5 | 1 | 9 |
| 11-nested-statischer-ram.md | server-hvsz-11 | Fortgeschritten | 8 | 8 | 5 | 0 | 9 |
| 12-vhdx-erweitern.md | server-hvsz-12 | Einsteiger | 9 | 8 | 5 | 1 | 9 |
| 13-differenzierend-eltern.md | server-hvsz-13 | Fortgeschritten | 9 | 8 | 5 | 1 | 10 |
| 14-vswitch-host-offline.md | server-hvsz-14 | Einsteiger | 8 | 8 | 5 | 1 | 9 |
| 15-vlan.md | server-hvsz-15 | Fortgeschritten | 9 | 8 | 5 | 1 | 10 |
| 16-intern-privat.md | server-hvsz-16 | Einsteiger | 8 | 8 | 5 | 1 | 10 |
| 17-doppelte-mac.md | server-hvsz-17 | Fortgeschritten | 9 | 8 | 5 | 1 | 10 |
| 18-export-import.md | server-hvsz-18 | Einsteiger | 9 | 8 | 5 | 1 | 10 |
| 19-replikat-einrichten.md | server-hvsz-19 | Fortgeschritten | 9 | 8 | 5 | 1 | 9 |
| 20-geplantes-failover.md | server-hvsz-20 | Profi | 9 | 8 | 5 | 1 | 9 |
| 21-livemigration-delegierung.md | server-hvsz-21 | Profi | 9 | 8 | 5 | 1 | 10 |
| 22-speichermigration.md | server-hvsz-22 | Einsteiger | 9 | 8 | 5 | 1 | 10 |
| 23-vm-haengt-beenden.md | server-hvsz-23 | Profi | 9 | 8 | 5 | 1 | 10 |
| 24-erweiterte-sitzung.md | server-hvsz-24 | Einsteiger | 9 | 8 | 5 | 1 | 10 |
| 25-powershell-direct.md | server-hvsz-25 | Fortgeschritten | 9 | 8 | 5 | 1 | 10 |
| **Summe** | | | **222** | **201** | **125 (25 Szenarien)** | **24** | |

Prüfung: `node tools/check-content.js --streng -v` → keine Fehler/Warnungen/Hinweise/leeren Verweise für 01–25; Gesamtlauf 0 Fehler.
Verweise nur auf existierende ids (az800-*, az801-hyperv-replica, az801-ad-replikation, az801-dsrm-sysvol, az801-credential-guard, az801-firewall-lokal, server-hvsz-*).

## Offene Punkte / Hinweise zur fachlichen Prüfung
- 05: MBR2GPT ist laut Doku für Windows 10/11 ab 1703 freigegeben; für Server-Gäste ist im Text „vorher an einer Kopie testen“ vermerkt.
- 19/20: Firewallregeln per sprachneutralem Namen `VIRT-HVRHTTPL-In-TCP-NoScope` / `VIRT-HVRHTTPSL-In-TCP-NoScope` (DisplayName englisch angegeben).
- 21: Aussage „Credential Guard unter Server 2025 standardmäßig aktiv → CredSSP-Live-Migration nicht nutzbar“ nach MS-Doku formuliert; bei Doku-Änderungen prüfen.
- 22: Aussage „eingelegte ISO-Dateien werden bei Move-VMStorage nicht mitverschoben“ – ggf. im Lab gegenprüfen.
- 25: Firewall-DisplayGroup im Beispiel deutsch („Windows-Remoteverwaltung“, engl. Kommentar).
- Nicht committet.
