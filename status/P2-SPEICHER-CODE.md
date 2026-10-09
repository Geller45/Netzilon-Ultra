# P2 – Speicher-Labor (Code) – Status

Dateien: `app/speicher.js` (ersetzt, ca. 600 Zeilen), `tools/test-paket.js` (neuer Abschnitt „Speicher-Labor (Paket 2)“ vor der Konsolenfehler-Prüfung). Sonst nichts geändert.

## Funktionen (`window.VIEWS.speicher`, `window.Speicher`)
- **SAN-Topologie (SVG, viewBox 400×440, skaliert)**: HV01/HV02/SQL01 (+ FILE01/BAK01 per „+ Server“, wieder entfernbar), je 2 HBAs mit WWPN, FC-A/FC-B (Fabric A/B), ARRAY01 mit Controller A/B (je 2 Target-Ports) und Plattenfächern (RG1–RG3 inkl. Hot Spares).
  Modi: **Verkabeln** (Port antippen → Switch antippen, oder umgekehrt; Kabel antippen = entfernen), **Ausfall** (Kabel/HBA/Switch/Controller/Platte antippen), **Ansehen** (Server → Host-Sicht, Switch → Zoning, Platte → RAID-Labor).
  I/O-Punkte laufen per requestAnimationFrame über alle aktiven Pfade (gelb = Active/Optimized, weiß = Non-Optimized).
- **LUNs & Masking**: Name/GB/RAID-Gruppe (Kapazitätsprüfung), Masking-Tabelle Host × LUN mit LUN-ID (+ / ✕ / Zahl ändern), Owner-Controller abwechselnd.
- **Zoning**: je Fabric angemeldete WWPNs (FLOGI) als Checkboxen, Zone anlegen/löschen, Single-Initiator-Kennzeichnung, aktive Konfiguration getrennt (Knopf „Konfiguration aktivieren (cfgenable)“, Warnung bei nicht aktivierten Änderungen).
- **Pfadprüfung „Was sieht Host X?“**: je LUN ✓/✗ für Masking, physischen Pfad, Zoning, RAID-Gruppe, LUN-ID-Eindeutigkeit + MPIO-Pfadliste (aktiv optimiert/nicht optimiert bzw. Grund des Ausfalls, ALUA-Failover bei Controller-Ausfall).
- **Ausfall simulieren**: Auswahlliste + Umschalten, „Alles wiederherstellen“, Matrix Host × LUN mit Pfadanzahl (⚠ = nur eine Fabric).
- **RAID-Labor**: RAID 0/1/5/6/10, 2–8 Platten, 1–16 TB, 0–3 Hot Spares; Kacheln mit 6 Stripes (D/P/Q, rotierende Parität); Ausfall → degradiert → Hot Spare springt automatisch ein bzw. „Tauschen“ → Rebuild mit Balken, Blöcke werden zeilenweise animiert rekonstruiert, XOR-Rechnung mit Hex-Werten (RAID 5), Kopie (RAID 1/10), P+Q-Erklärung (RAID 6). Zweiter Ausfall bei RAID 5 = Datenverlust (LUNs unsichtbar, „Backup zurückspielen“), RAID 6 übersteht zwei. Nutzkapazität: 0 = n, 1 = 1, 5 = n−1, 6 = n−2, 10 = n/2.
- **12 Aufgaben** (leicht→schwer): kap6, kap10 (Rechnen), kabel-sql, lun-sql, mask-sql, lun-id, zone-hv01 (Single-Initiator), hv02-redundant (übersteht Ausfall Switch A, geprüft mit simuliertem FCA-Ausfall), rebuild5, raid6-doppel, sql-mpio, ctl-ausfall. Automatische Prüfung nach jeder Änderung; erstes Lösen → `S.p.speicher.geloest[id] = heute()`, `melde('speicher', 1)`, `Mot.konfetti(80)`, Toast, Gong. Fortschrittsbalken x/12.
- **Legende** (10 `<details>`, je Was/Wie/Wann/Wo/Warum): SAN, LUN, LUN-Masking, Zoning, WWPN, HBA, MPIO, RAID-Level, Hot Spare, Rebuild.
- **Zustand** in `S.p.speicher.zustand` (JSON), `speichern()` nach jeder Änderung (Rebuild: jede Sekunde). `normal()` validiert alles feldweise (unbekannte Server/Ports/Zonen/LUNs werden verworfen, falsche Version/Struktur → Startzustand). „Labor zurücksetzen“ (mit Bestätigung; gelöste Aufgaben bleiben).
- **Timer**: rAF-Schleife und Rebuild-Intervall laufen nur, solange `S.ansicht.ansicht === 'speicher'` und `#spm-wurzel` im DOM ist; danach Stopp, Rebuild setzt beim Wiederkommen fort.
- CSS einmalig per `<style id="spm-style">`, alle Klassen/IDs mit `spm-`, nur Theme-Variablen; einspaltig unter 820 px, Tabellen in eigenem Scroll-Container.

## Test-Hooks (`Speicher._test`)
`z()` aktueller Zustand · `sicht(host, lun, extraAus[])` Pfadprüfung · `schnell(f)` Rebuild-Tempo (1–500×) · `rebuildFertig()` · `laeuft()` {raf, timer} · `normal(z)` · `start()` · `pruefe(still)`. Außerdem `Speicher.nutzTB(level, n, tb)`, `Speicher.AUFGABEN`.

## Testergebnisse
`node tools/check-content.js && node tools/build-html.js && node tools/test-ui.js && node tools/test-paket.js` → alles grün (check-content 0 Fehler/0 Warnungen, test-ui „Alle Tests bestanden“, test-paket „ALLES OK“).
Neue Prüfungen in test-paket (26): Ansicht, LUN anlegen + mappen, Verkabeln per Klick, ✗ ohne Zone, Zoning auf beiden Fabrics → Pfadprüfung ✓ (4 Pfade/2 Fabrics), Host-Sicht-UI, I/O-Animation, Switch A aus → weiter über Fabric B, Wiederherstellen, RAID-5-Rebuild (Hot Spare, Balken, XOR, beschleunigt fertig), RAID-5-Doppelausfall = Datenverlust, RAID 6 übersteht zwei, Nutzkapazitäten, Rechenaufgabe, 7 Aufgaben gelöst + XP gestiegen + x/12, Timer gestoppt nach `gehe('home')`, Zustand bleibt erhalten, kaputter Zustand → Validierung, 390 px ohne Überlauf, keine Konsolenfehler.
Zusätzlich manuell per Playwright geprüft: die übrigen 5 Aufgaben (lun-id, hv02-redundant, zone-hv01, ctl-ausfall, kap10) lassen sich per Klick lösen; RAID-Umbau; Server hinzufügen/entfernen.
Screenshots: `dist/screens/p2-speicher.png`, `p2-speicher-raid.png`, `p2-speicher-390.png`.
