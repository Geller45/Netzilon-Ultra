# P2-E – Vollständigkeits-Prüfer (Paket 2, Punkte f und g)

Stand: Netzilon Ultra 2.2.0 · nicht committet.

## Ergebnis in Zahlen
- **20 neue Themenseiten** in `content/ergaenzung/` (Format 2.0, je Legende mit 2 Blöcken, 10 Karteikarten, 9 Quizfragen mit `! Erklärung`, 4–5 Lücken, 3–4 Zuordnen-, 3 Reihenfolge-, 3 Freitext-, 3 Szenario-Aufgaben, 1–2 animierbare Grafiken, Lab mit Maschinenangabe; Windows-Labs mit GUI + PowerShell, Linux/Cisco per CLI).
- **Lückenmatrix**: vorher **67 Zellen < 3** (davon 40 mit 0), nachher **0 Zellen < 3** (außer der bewusst ausgenommenen Zeile „Querschnitt/Prüfungsorganisation“).
- **Altbestand**: alle **180 Hinweise „(<8)“** abgearbeitet → `node tools/check-content.js --streng -v`: **0 Fehler, 0 Warnungen, 0 Hinweise**. Dafür **488 Quizfragen** (alle mit genau 1 richtigen, 3 falschen Antworten und `! Erklärung`) und **1 Karteikarte** an das Ende der vorhandenen `## Quiz`/`## Karteikarten`-Abschnitte von **180 Dateien** angehängt; kein bestehender Text geändert oder gelöscht.
- Gesamt: 630 Dateien, 7.802 Karteikarten, 7.529 Aufgaben (vorher 611 / 7.611 / 6.546).
- `node tools/check-content.js` → **0 Fehler, 0 Warnungen**; `node tools/build-html.js` → dist/Netzilon-Ultra.html 3,81 MB, 630 Inhaltsdateien; `node tools/test-paket.js` → **ALLES OK**. Zusätzlicher Playwright-Rendertest aller 20 `erg-*`-Seiten bei 390 px: keine „Hoppla“, Legende sichtbar, kein Überlauf, keine Konsolenfehler.

## Pool-Größen (Regeln wie in app/ziele.js / lernen.js `passtZuTag`)
| Pool | vorher | nachher | Soll |
|---|---:|---:|---:|
| Aufgabe des Tages (mc/luecke/zuordnen/reihenfolge, AP1/AP2/WiSo) | 3.422 | **4.027** | ≥ 365 ✓ |
| Zufallsprüfung AP1 (alle Arten / davon automatisch) | 1.894 / 1.826 | **2.535 / 2.353** | ≥ 60 ✓ |
| Zufallsprüfung AP2 (AP2 + WiSo) | 3.089 / 2.878 | **3.641 / 3.316** | ≥ 60 ✓ |
| Zufallsprüfung WiSo | 555 / 481 | **607 / 521** | ≥ 60 ✓ |

## Methode
Skript `luecken-matrix.js` (Scratchpad dieser Sitzung; nutzt `tools/lib.js` → `ladeParser()`, `sammle()`). Zuordnung jeder Datei zu genau **einem** FiSi-Bereich über eine geordnete Pfad-Regelliste (Ordner bzw. Dateinummer, abgeleitet aus `bereich`/`kapitel`/`titel`); gemischte Ordner (`ihk/`, `ap2/`, `legacy/`, `netz/`, `server/s*`, `ccna/`, `pruefung/`) dateiweise. Zusätzlich zu den 22 geforderten Bereichen: „Zahlensysteme/Logik/Einheiten“ (eigener AP1-Block) und „Querschnitt/Prüfungsorganisation“ (Prüfungsaufbau, Operatoren, Lernzettel-Guides, Übungsklausuren, CCNA-Überblick – fachübergreifend, daher von der ≥ 3-Regel ausgenommen). Neue Dateien werden über das Kürzel im Dateinamen (`NN-hw-`, `-win-`, `-lx-` …) zugeordnet.

## Matrix vorher (fett = < 3)
| Bereich | Dateien | MC | Lücke | Zuordnen | Reihenfolge | Freitext | Szenario | Karten |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| IT-Hardware/Arbeitsplatz | 20 | 146 | 3 | **2** | **1** | **0** | **0** | 561 |
| Zahlensysteme/Logik/Einheiten | 8 | 59 | 9 | 4 | **1** | **2** | **1** | 84 |
| Betriebssysteme Windows-Client | 7 | 44 | **0** | **1** | **0** | **0** | **0** | 127 |
| Linux | 108 | 1057 | 105 | **2** | **0** | 32 | 12 | 1084 |
| Netzwerkgrundlagen/OSI/TCP-IP | 19 | 190 | 8 | 4 | 3 | **2** | **0** | 304 |
| IPv4/IPv6/Subnetting | 14 | 102 | 15 | **1** | 3 | **1** | **1** | 143 |
| Routing/Switching/VLAN | 19 | 154 | 12 | **0** | **1** | **0** | **0** | 252 |
| WLAN | 3 | 26 | **0** | **1** | **0** | **0** | **0** | 31 |
| Netzdienste DNS/DHCP | 19 | 125 | 3 | **1** | **0** | **0** | **0** | 211 |
| Active Directory/GPO | 47 | 347 | 3 | **1** | **2** | **0** | **1** | 407 |
| Windows Server/Hyper-V/Virtualisierung | 86 | 696 | 24 | 8 | 44 | 16 | 58 | 793 |
| Speicher/RAID/SAN/Backup | 34 | 308 | 31 | 11 | 10 | 12 | 9 | 383 |
| IT-Sicherheit/Datenschutz/Kryptografie | 36 | 291 | 3 | **2** | **1** | 5 | **0** | 705 |
| Cloud/Container | 14 | 87 | 8 | 3 | **2** | **1** | **0** | 147 |
| Skripting/Programmierung | 18 | 177 | 27 | 7 | 5 | 11 | **0** | 600 |
| Datenbanken/SQL | 55 | 659 | 57 | 129 | 23 | 5 | **0** | 308 |
| Projektmanagement | 10 | 99 | 11 | **2** | 3 | 6 | **0** | 133 |
| Kundenberatung/Angebot/Kalkulation | 6 | 64 | **0** | **0** | **0** | **0** | **0** | 229 |
| Qualitätsmanagement/ITIL/Support | 11 | 100 | 9 | 4 | **2** | 3 | **0** | 190 |
| Elektrotechnik/USV/Energie | 4 | 25 | 3 | **1** | **1** | **2** | **1** | 37 |
| WiSo | 45 | 458 | 100 | 36 | 30 | 52 | 22 | 532 |
| Monitoring/Logging | 6 | 38 | **0** | **0** | **0** | **0** | **0** | 53 |
| Lizenzen/Verträge | 6 | 55 | **0** | **0** | **0** | **0** | **0** | 100 |
| Querschnitt/Prüfungsorganisation | 15 | 142 | 15 | 6 | **2** | 9 | **2** | 187 |

## Matrix nachher
| Bereich | Dateien | MC | Lücke | Zuordnen | Reihenfolge | Freitext | Szenario | Karten |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| IT-Hardware/Arbeitsplatz | 21 | 190 | 7 | 5 | 4 | 3 | 3 | 571 |
| Zahlensysteme/Logik/Einheiten | 9 | 83 | 14 | 7 | 4 | 5 | 4 | 94 |
| Betriebssysteme Windows-Client | 8 | 67 | 5 | 4 | 3 | 3 | 3 | 137 |
| Linux | 109 | 1069 | 110 | 5 | 3 | 35 | 15 | 1094 |
| Netzwerkgrundlagen/OSI/TCP-IP | 20 | 207 | 13 | 7 | 6 | 5 | 3 | 314 |
| IPv4/IPv6/Subnetting | 15 | 123 | 20 | 4 | 6 | 4 | 4 | 153 |
| Routing/Switching/VLAN | 20 | 171 | 17 | 3 | 4 | 3 | 3 | 262 |
| WLAN | 4 | 35 | 5 | 5 | 3 | 3 | 3 | 41 |
| Netzdienste DNS/DHCP | 20 | 169 | 8 | 4 | 3 | 3 | 3 | 221 |
| Active Directory/GPO | 48 | 454 | 8 | 4 | 5 | 3 | 4 | 417 |
| Windows Server/Hyper-V/Virtualisierung | 86 | 767 | 24 | 8 | 44 | 16 | 58 | 793 |
| Speicher/RAID/SAN/Backup | 34 | 356 | 31 | 11 | 10 | 12 | 9 | 383 |
| IT-Sicherheit/Datenschutz/Kryptografie | 37 | 350 | 8 | 5 | 4 | 8 | 3 | 715 |
| Cloud/Container | 15 | 125 | 13 | 6 | 5 | 4 | 3 | 157 |
| Skripting/Programmierung | 19 | 194 | 32 | 10 | 8 | 14 | 3 | 610 |
| Datenbanken/SQL | 56 | 668 | 62 | 132 | 26 | 8 | 3 | 318 |
| Projektmanagement | 11 | 111 | 16 | 5 | 6 | 9 | 3 | 143 |
| Kundenberatung/Angebot/Kalkulation | 7 | 76 | 5 | 3 | 3 | 3 | 3 | 239 |
| Qualitätsmanagement/ITIL/Support | 12 | 123 | 14 | 7 | 5 | 6 | 3 | 200 |
| Elektrotechnik/USV/Energie | 5 | 40 | 8 | 4 | 4 | 5 | 4 | 47 |
| WiSo | 45 | 463 | 100 | 36 | 30 | 52 | 22 | 532 |
| Monitoring/Logging | 7 | 59 | 5 | 3 | 3 | 3 | 3 | 64 |
| Lizenzen/Verträge | 7 | 71 | 5 | 3 | 3 | 3 | 3 | 110 |
| Querschnitt/Prüfungsorganisation | 15 | 146 | 15 | 6 | **2** | 9 | **2** | 187 |

## Angelegte Dateien (`content/ergaenzung/`, kapitel „Ergänzungen 2.2“, block ERG)
| Datei | id | bereich | pruefungen | füllt Lücken in |
|---|---|---|---|---|
| 01-hw-it-arbeitsplatz.md | erg-it-arbeitsplatz | AP1 | AP1, AP2 | IT-Hardware/Arbeitsplatz |
| 02-zl-zahlen-logik-praxis.md | erg-zahlen-logik-praxis | AP1 | AP1 | Zahlensysteme/Logik |
| 03-win-windows-client.md | erg-windows-client | AP1 | AP1, AP2, Schule | Windows-Client |
| 04-lx-linux-admin-praxis.md | erg-linux-admin-praxis | Linux | LPIC-1, AP2, Schule | Linux |
| 05-ng-osi-fehlersuche.md | erg-osi-fehlersuche | AP1 | AP1, AP2, CCNA | Netzwerkgrundlagen |
| 06-ip-adressplanung.md | erg-ip-adressplanung | AP1 | AP1, AP2, CCNA | IPv4/IPv6/Subnetting |
| 07-rs-vlan-routing-kmu.md | erg-vlan-routing-kmu | AP1 | AP1, AP2, CCNA | Routing/Switching/VLAN |
| 08-wl-wlan-planung.md | erg-wlan-planung | AP1 | AP1, AP2, CCNA | WLAN |
| 09-dn-dns-dhcp-betrieb.md | erg-dns-dhcp-betrieb | AP1 | AP1, AP2, Schule | DNS/DHCP |
| 10-ad-gpo-praxis.md | erg-ad-gpo-praxis | AP1 | AP1, AP2, Schule | AD/GPO |
| 11-si-sicherheitskonzept-vorfall.md | erg-sicherheitskonzept-vorfall | AP2 | AP1, AP2 | IT-Sicherheit/Datenschutz/Krypto |
| 12-cl-cloud-container-entscheidung.md | erg-cloud-container-entscheidung | AP2 | AP1, AP2 | Cloud/Container |
| 13-pr-skripting-admin.md | erg-skripting-admin | AP2 | AP1, AP2, Schule | Skripting (PowerShell/Bash/Python) |
| 14-db-sql-praxisfaelle.md | erg-sql-praxisfaelle | AP2 | AP1, AP2, Schule | Datenbanken/SQL |
| 15-pm-projekt-netzplan-praxis.md | erg-projekt-netzplan-praxis | AP2 | AP1, AP2 | Projektmanagement |
| 16-ku-kundenberatung-angebot.md | erg-kundenberatung-angebot | AP1 | AP1, AP2, WiSo | Kundenberatung/Angebot/Kalkulation |
| 17-qm-itil-support.md | erg-itil-support | AP2 | AP1, AP2 | QM/ITIL/Support |
| 18-el-energie-usv-poe.md | erg-energie-usv-poe | AP1 | AP1, AP2 | Elektrotechnik/USV/Energie |
| 19-mo-monitoring-logging.md | erg-monitoring-logging | AP2 | AP1, AP2, Schule | Monitoring/Logging |
| 20-lv-lizenzen-vertraege.md | erg-lizenzen-vertraege | AP2 | AP1, AP2, WiSo | Lizenzen/Verträge |
Je Datei: 10 Karten, 9 Quiz, 4–5 Lücken, 3–4 Zuordnen, 3 Reihenfolge, 3 Freitext, 3 Szenarien (zusammen 200 Karten, 180 Quiz, 99 Lücken, 61 Zuordnen, 60 Reihenfolge, 60 Freitext, 60 Szenarien). Alle `verweise` zeigen auf existierende ids (kein „Verweis ins Leere“). Alle Rechenbeispiele (VLSM, Netzplan, Kalkulation, Stromkosten, USV, PoE, Lizenzkerne, Verfügbarkeit) nachgerechnet.

## Aufgefüllte Altdateien (nur Anhängen am Abschnittsende)
| Ordner | Dateien | neue Quizfragen | Bemerkung |
|---|---:|---:|---|
| ap1/a1–a6 | 49 | 147 | je +3 (5 → 8) |
| ap2/a11-ap2 | 19 | 58 | 00/04/16 je +4, 12/17 je +2, sonst +3 |
| az800/d1–d5 | 55 | 163 | d1/02 und d1/15 je +4, d5/07–09 je +1/+2 |
| az801/d1–d5 | 43 | 91 | je +2 (6 → 8), einzelne +3; d5/02 zusätzlich +1 Karteikarte (7 → 8) |
| legacy/a12-legacy-box | 14 | 29 | 00 +3, sonst +2 |
| **Summe** | **180** | **488** | + 1 Karteikarte |
Nicht angefasst: `content/wiso/3[0-9]-*`, `content/server/hyperv*`, `content/server/speicher/`, `app/`, `tools/` (dort gab es ohnehin keine Hinweise).

## Offene Punkte
1. „Querschnitt/Prüfungsorganisation“ hat Reihenfolge = 2 und Szenario = 2 – bewusst ausgenommen (keine Fachdomäne); bei Bedarf eine Seite „Prüfungsstrategie AP1/AP2“ mit Szenarien ergänzen.
2. Dünn besetzt (≥ 3, aber knapp): WLAN (4 Dateien, 3 Reihenfolge/Freitext/Szenario), Monitoring/Logging, Lizenzen/Verträge, Kundenberatung (jeweils genau 3 je Art außer MC) – weitere Ausbau-Kandidaten.
3. Die Altdateien (ap1, ap2, az800, az801, legacy) haben weiterhin **keine `## Legende`** und kaum Lücken/Zuordnen/Reihenfolge – Auftrag war nur Karten/Quiz ≥ 8; Legenden nachzurüsten wäre ein eigener Schritt.
4. Zahlenwerte mit Stand-Charakter (Supportfristen, Azure-Backup-Intervalle, SNMP/Syslog-Ports sind stabil) in den neuen Quizfragen bei der nächsten Aktualisierung prüfen; konkrete Gesetzes-/Beitragszahlen wurden vermieden.
5. Die Bereichszuordnung der Matrix ist eine Primärzuordnung (eine Datei = ein Bereich); Mischdateien (z. B. ihk-Glossare, Lernzettel) zählen nur in einem Bereich.
