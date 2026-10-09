# P2-D – Anomalie-Prüfer (Paket 2, Netzilon Ultra 2.2.0)

Geprüft: `content/wiso/30–39`, `content/server/hyperv/01–09`, `content/server/hyperv-szenarien/01–50`, `content/server/speicher/01–09` (78 Dateien), `app/speicher.js`, die Legende in `app/parser.js` und `app/app.js`, die speicher-Felder in `app/app.js` und `app/motivation.js`, `.leg-*` in `app/style.css`.
Vorgehen: Alle Quizfragen samt richtiger Antwort maschinell ausgegeben und gelesen, die Labs und Profi-Texte der markierten Stellen gelesen, eigene Scan-Skripte für die formalen Prüfungen, Playwright-Tests.
Abschlusskette: `check-content` (0 Fehler, 0 Warnungen) → `build-html` → `test-ui` („Alle Tests bestanden“) → `test-paket` („ALLES OK“, mit neuem Abschnitt „Anomalie P2“). Nichts committet.

## 1. Fachliche Fehler – gefunden und behoben
| Datei | Befund | Änderung |
|---|---|---|
| hyperv/01-nested-grundlagen | Quiz-Erklärung „Version 8.0 = Server 2016 / Windows 10 **1709**“ ist falsch, richtig ist 1607 (1709 = 8.2) | auf 1607 korrigiert, Hinweis „AMD ≥ 9.3“ ergänzt |
| hyperv/01 | Lücke „mindestens Konfigurationsversion {8.0}“ ohne Herstellerangabe (für AMD nennt die Doku 9.3, im Web nachgeprüft) | auf „auf einem Intel-Host“ eingegrenzt |
| hyperv/03 | Host-VBS: genaue Versionsangabe „Server 2019+, Windows 10 ab 1803“ war nicht belegt | vorsichtig formuliert (frühe Versionen 2016 → aktuelle 2022/2025/Win 11 kombinierbar) |
| hyperv/03 (Dynamic Memory bei Nested) | Aussage geprüft: Sie stimmt mit der MS-Doku überein (DM wirkungslos, Resize scheitert nur bei laufendem Hypervisor) | nichts geändert |
| hvsz-19 / hvsz-20 | Firewallregel nur per festem Namen `VIRT-HVRHTTPL-In-TCP-NoScope` | zuerst `Get-NetFirewallRule -Name "VIRT-HVR*"` (Name/DisplayName anzeigen), dann aktivieren; der englische DisplayName steht als Kommentar dabei |
| hvsz-25 | `-DisplayGroup "Windows-Remoteverwaltung"` hängt von der Sprache ab | ersetzt durch sprachneutrales `Get-NetFirewallRule -Name "WINRM-HTTP-In-TCP*" \| Enable-NetFirewallRule`, dazu Kommentar dt./engl. |
| hvsz-22 | „Hyper-V verschiebt ISO nicht“ als absolute Aussage | begründet über das, was die Speichermigration laut Doku verschiebt (VHD, Konfiguration, Prüfpunkte, Smart Paging) |
| hvsz-45 | Optimize-VHD Pretrimmed/Prezeroed „auch bei laufender VM“ ist nicht belegt (die Doku sagt nur: kein schreibgeschütztes Einbinden nötig) | Profi-Text, Lösungsweg, Merksatz, Code-Kommentar, 2 Karten, Legende und Quizfrage auf „kein schreibgeschütztes Einbinden“ umgestellt, Hinweis „an laufender VM vorher testen“ |
| hvsz-05 (MBR2GPT für Server) | Text sagt bereits „laut Doku für Windows 10/11, in Server-Gästen vorher an einer Kopie testen“ | belassen |
| hvsz-21 (Credential Guard unter Server 2025 → CredSSP) | Entspricht der MS-Doku (Standard auf geeigneten, domänengebundenen Nicht-DCs; Kerberos-Delegierung empfohlen) | belassen |
| wiso/30 | Erklärung „§ 15 Abs. 2 **Nr. 1**“ für die Anrechnung des Berufsschultags (> 5 × 45 min) | → „§ 15 Abs. 2 Nr. 2 und Abs. 3 BBiG“ |
| wiso/34, 36 | „Bürgergeld“ – Rechtsstand 2026 unsicher (Umbau zur „Grundsicherung“) | neutral „Grundsicherung (Bürgergeld)“ |
| wiso/37 | Antwort „Entsiegelte Software auf einem versiegelten Datenträger“ widersprüchlich | → „… dessen Versiegelung der Kunde nach der Lieferung entfernt hat“ |
| speicher/03 | FC-1: „256b/257b ab 16/32 GFC“ – 32GFC nutzt 64b/66b | → 64b/66b (16/32 GFC), 256b/257b (ab 64 GFC) |
| speicher/07 | Slab-Größe 256 MB als allgemeine Aussage | ergänzt: bei S2D „Extents“ von 1 GB |

Stichproben ohne Befund: 325-€-Geringverdienergrenze (§ 20 Abs. 3 SGB IV), Minijob 2026 = 603 € (13,90 € × 130 / 3, aufgerundet), Midijob bis 2.000 €, § 622 BGB (Tabelle und Fristrechnungen), § 20/21/22/24 BBiG, JArbSchG §§ 9, 11, 13, 14, 19, 32, BetrVG §§ 1, 7, 8, 9, 38, 60, 61, 78a, 99, 102, KSchG §§ 1, 4, 7, 23 (Teilzeit 0,5/0,75), BGB §§ 108, 110, 124, 438, 477, HGB § 49/§ 54, GmbH/UG/AG-Kapital. Speicher: RAID-Formeln und alle Rechenaufgaben nachgerechnet, iSCSI 3260/iSNS 3205, IQN-Format, FC-0…FC-4, FC-AL 127 Ports, Rahmen 2148 Byte, MSDSM-Richtlinien und mpclaim-Nummern 0–7, Storage-Spaces-Mindestplatten 2/5/3/7, S2D 2–16 Knoten. Hyper-V: SET max. 8 NICs, MAC-Pool 256, Puffer 20 %, Gewicht 100, MinimumBandwidthWeight 0–100, Standard-Versionen 8.0/9.0/10.0/12.0.

## 2. Formale Anomalien
- **Doppelte Quizfragen** (exakt gleicher Fragetext, 12 Stück) – **umformuliert** in: hyperv/07 (SET), hyperv/09 (Prüfpunkt löschen), hvsz-04 (Azure-NAT), hvsz-26 (Kerberos-Toleranz), hvsz-38 (Update-VMVersion), speicher/01 (iSCSI-Port), speicher/09 (RPO), wiso/31 (KSchG-Klage), wiso/33 (3×), wiso/34 (Kirchensteuer), wiso/36 (Kartell). Ältere Dateien wurden nicht angefasst.
- Keine Funde bei: kaputten Lücken `{}`, Lücken, die ihre Lösung im Satz verraten, Pipes ohne `\` (Karten/Freitext/Szenario), `## ` in Codeblöcken, offenen Codeblöcken, leeren Abschnitten, Legende ohne Felder, nicht animierbaren Grafiken, falschen Antwortzahlen (Einfachwahl immer 1 + 3).
- Mehrfachwahl-Fragen in WiSo (20 Stück, gekennzeichnet mit „(2/3 richtige)“): alle inhaltlich geprüft, sie stimmen.
- Zuordnen mit gleicher rechter Seite (hyperv/04, wiso/30, wiso/36) ist gewollt; die Auswertung vergleicht nach Text, das ist korrekt.
- **OFFEN (Stil, nicht behoben):** Bei Einfachwahl ist die richtige Antwort auffällig oft die **längste** (hyperv 69 %, hvsz 57 %, speicher 43 %, WiSo ca. 50 %; bei Zufall wären es ~25 %). Man kann also raten. Das betrifft gut 700 Fragen – das sollte ein eigener Überarbeitungsauftrag sein (Distraktoren verlängern bzw. richtige Antworten kürzen).
- Ebenfalls offen: hvsz-44 („VHD-Satz ab Gast-OS Server 2016“) habe ich nicht sicher belegen können – vor der nächsten Version gegenprüfen.

## 3. Code
- `app/speicher.js` `normal()`: Doppelte Kabel-IDs blieben erhalten, und ein zu kleiner `kid` erzeugte neue IDs, die mit vorhandenen kollidierten → **behoben**: IDs sind jetzt eindeutig und `kid` liegt über der größten vorhandenen `k<n>`. Eine Platte im Zustand „warte“ ohne laufenden Rebuild blieb nach dem Laden hängen → **behoben** (der Rebuild startet). Bei einer ausgefallenen Gruppe (`tot`) wird `rb` jetzt verworfen.
- `app/app.js` `migrieren`: `speicher.geloest` als Array wurde nicht ersetzt (beim JSON-Speichern wären gelöste Aufgaben verloren gegangen); `best` wurde gar nicht geprüft → **behoben** (Array → `{}`).
- `app/style.css` `.leg-raster`: `minmax(280px, …)` konnte auf schmalen Geräten überlaufen → `minmax(min(280px, 100%), 1fr)`; `.leg-karte`/`dd` umbrechen lange Befehle (`min-width: 0`, `overflow-wrap`).
- Ohne Befund: alle Klassen/IDs mit `spm-` und `#spm-style` sind eindeutig (grep über app/*.js, style.css, index.html). Keine Listener auf `document` (nur auf `#spm-wurzel`, das bei jedem Aufruf neu angelegt wird). `requestAnimationFrame` und `setInterval` stoppen beim Verlassen; Schleifen sind begrenzt. XP und Abzeichen (`speicher: 15`, san1/san10) sind eingebunden.
- Playwright-Test (`tools/test-paket.js`, neuer Abschnitt „Anomalie P2“, bestehende Tests unverändert): 8 alte bzw. kaputte Fortschrittsstände per localStorage (ohne `speicher`, String, Array, `zustand` = `{foo:1}`/`null`/Array/String/v1 mit Müll) → App startet, Speicher-Labor öffnet, kein „Hoppla“; Bereinigung und Timer-Stopp geprüft; 10 neue Themenseiten mit Legende (`.leg-abschnitt` sichtbar) und je einer Aufgabe jeder vorhandenen Art beantwortet → keine Konsolenfehler; Legende bei 390 px ohne Überlauf.

## Geänderte Dateien
content/server/hyperv/01, 03, 07, 09 · content/server/hyperv-szenarien/04, 19, 20, 22, 25, 26, 38, 45 · content/server/speicher/01, 03, 07, 09 · content/wiso/30, 31, 33, 34, 36, 37 · app/speicher.js · app/app.js (migrieren) · app/style.css (.leg-*) · tools/test-paket.js (Abschnitt „Anomalie P2“).
