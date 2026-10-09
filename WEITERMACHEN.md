# WEITERMACHEN – Netzilon Ultra (Übergabe für einen neuen Chat)

## Stand
| Paket | Version | Status |
|---|---|---|
| 1 Motivation & Prüfungsmodi | 2.1.0 | fertig |
| 2 Inhalte (WiSo 277, Hyper-V 212, 50 Hyper-V-Szenarien, SAN 206, Speicher-Labor, Legende, Vollständigkeit) | 2.2.0 | fertig |
| 3 SQL-Labor (sql.js offline, Firmen-DB 100 Mitarbeiter, 60 Aufgaben, 10 Themenseiten) | 2.3.0 | fertig (siehe CHANGELOG) |
| 4 Domänen-Simulator „Meine Domäne“ | – | **offen** |
| 5 Wireshark-Simulator | – | **offen** |
| Gesamtprüfung, finale ZIP + HTML | – | **offen** |

Git: Repo `geller45/netzilon-ultra`, Branch `claude/netzilon-ultra-pakete-2-5-yqa2bv`.

## Aufbau (wichtig für neue Module)
- App-Code: `netzilon-ultra/app/*.js`, Inhalte: `netzilon-ultra/content/**/*.md` (Format: `content/_SCHEMA.md`, `BAUPLAN.md`, Regeln `status/P2-BRIEF.md`).
- Neues Modul = eigene Datei `app/<modul>.js` nach Muster `app/speicher.js` / `app/sql.js`:
  `const X = (() => { … window.VIEWS = Object.assign(window.VIEWS || {}, { route: ansicht }); return {…}; })(); window.X = X;`
  CSS per `<style id="<präfix>-style">` aus dem Modul injizieren, ALLE Klassen/IDs mit eigenem Präfix (`.s1`–`.s5` sind vom Intro belegt; vergeben: `spm-` Speicher, `sql-` SQL, `leg-` Legende).
- Einbinden: `app/index.html` (`<script src=…>` vor `app.js`), `app/app.js`: `gehe()`-Tab-Mapping (`route: 'werkzeuge'`), Startseite `aktionen` + `hubWerkzeuge()`, Fortschrittsfeld in `neuerFortschritt()` UND `migrieren()` (alte Stände müssen laden), `app/motivation.js`: XP-Tabelle `XP`, `QUESTS`, `ABZEICHEN`; Ereignis `melde('<art>', 1)`.
  Für Paket 4/5 sind die Routen `domaene` und `wireshark` in `app/ziele.js` schon als „Tagesaufgabe nicht einblenden“ eingetragen.
- Firmen-DB für Paket 4: `FirmaDB.mitarbeiter()` (app/sqldb.js) liefert die 100 Mitarbeiter inkl. `benutzername`, `abteilung`, `kuerzel`, `stadt`, `aktiv`, `vorgesetzter` → als AD-Benutzer verwenden.
- Netzwerk-Simulator für Paket 5: `app/netsim.js` (Topologie in `S.p.netsim.topo`).

## Tests (alles muss grün sein)
```
cd netzilon-ultra
npm install --omit=dev --ignore-scripts   # nur Schriften, falls node_modules fehlt
node tools/check-content.js               # 0 Fehler, 0 Warnungen
node tools/build-html.js                  # -> ../dist/Netzilon-Ultra.html
node tools/test-ui.js                     # Playwright/Chromium
node tools/test-paket.js                  # je Paket eigener Abschnitt ergänzen
node tools/test-sqldb.js && node tools/test-sqlaufgaben.js
```
Je Paket: CHANGELOG.md + Version (app/app.js `VERSION`, package.json, package-lock.json Zeile 3/9) hochzählen, ZIP ohne node_modules/dist + Netzilon-Ultra.html liefern. EXE: `bauen.bat` unter Windows.

## Offene Aufträge (Original-Wortlaut gekürzt)
**Paket 4 – Domänen-Simulator** (`app/domaene.js`, Route `domaene`, Fortschritt `S.p.domaene`): simulierte AD-Umgebung (DC, OUs, Benutzer, Gruppen, GPOs, DNS, DHCP, Freigaben/NTFS, Vertrauensstellungen) mit GUI-ähnlicher Bedienung (ADUC-Baum, GPMC, DNS-/DHCP-Konsole) UND simulierter PowerShell (New-ADUser, Get-ADUser -Filter, New-ADGroup, Add-ADGroupMember, New-ADOrganizationalUnit, Move-ADObject, Disable-ADAccount, New-GPO, New-GPLink, Add-DnsServerResourceRecordA, Add-DhcpServerv4Scope, New-SmbShare, Get-Acl/Set-Acl …). Aufgaben aus der Praxis („neuer Mitarbeiter“, „Abteilung wechselt“, „Rechte zu weit“, „Mitarbeiter verlässt Firma“) mit Auswertung; Zustand speicherbar/zurücksetzbar; die 100 Mitarbeiter aus FirmaDB als AD-Benutzer. XP `domaene`.

**Paket 5 – Wireshark-Simulator** (`app/wireshark.js`, Route `wireshark`, Fortschritt `S.p.wireshark`): simulierter Mitschnitt mit Paketen ARP, DHCP (DORA), DNS, ICMP, TCP-Handshake, HTTP/HTTPS (TLS-Handshake), SMB, Kerberos/LDAP; Paketliste, Anzeigefilter (ip.addr==, ip.src/dst, tcp.port==, udp.port==, dns, arp, dhcp/bootp, http, tcp.flags.syn==1, &&, ||, !), Paketdetails mit aufklappbaren Schichten, Hex-Ansicht, „Follow TCP Stream“. Aufgaben („Finde die DHCP-Lease“, „Wer hat den Port-Scan gemacht?“, „Welche DNS-Antwort …“) mit Auswertung; Anbindung an den Netzwerk-Simulator (Mitschnitt aus einem Ping im Netsim erzeugen). XP `wireshark`.

**Übergreifend:** XP/Level/Streak/Abzeichen/Konfetti anbinden, interaktiv + animiert, Zustand in fortschritt.json/localStorage, alles Deutsch. Am Ende Gesamtprüfung aller Pakete, finale ZIP + HTML.

## Prompt für den neuen Chat (kopieren)
> Entpacke die hochgeladene ZIP (netzilon-ultra-2.3-paket3.zip) in ein leeres Verzeichnis. Lies zuerst WEITERMACHEN.md, BAUPLAN.md und netzilon-ultra/CHANGELOG.md. Baue dann Paket 4 (Domänen-Simulator) nach WEITERMACHEN.md mit genau 1 Agent, lass alle Tests laufen, liefere ZIP + Netzilon-Ultra.html. Danach Paket 5 genauso, dann Gesamtprüfung. Antworte kurz.
