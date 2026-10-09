# P5 – Wireshark-Simulator (2.5.0) + Gesamtprüfung

## Umgesetzt
- `netzilon-ultra/app/wireshark.js` (`window.Wireshark`, Route `wireshark`, CSS `#ws-style`, Präfix `ws-`).
- Mitschnitte (deterministisch, Seed): **Büro-Start** 67 Pakete (DHCP DORA inkl. Lease 8 Tage, ARP, DNS A/AAAA mit CNAME, ICMP, TCP-Handshake, HTTP GET/200, TLS 1.3 Client/Server Hello mit SNI + Application Data, RST, Kerberos AS/TGS, LDAP bind/search, SMB2 Negotiate/Session Setup/Tree Connect, FIN), **Port-Scan** (10.0.0.66 → FS01, offen 135/139/445/3389), **Fehlersuche** (NXDOMAIN, ICMP Network/Port unreachable, 3 SYN-Retransmissions).
- Echte Bytes: Ethernet/IPv4/TCP/UDP/ICMP/ARP korrekt, IP- und TCP/UDP-Prüfsummen (Pseudo-Header) korrekt (per Test verifiziert); DNS/DHCP/TLS/SMB2 strukturgetreu, Kerberos/LDAP als DER.
- Paketliste mit Wireshark-Farben, animiertes Aufzeichnen (▶/■/⏭), Filter-Parser (Felder, Protokolle, ==/!=/</>/contains, &&/and, ||/or, !/not, Klammern, CIDR), grün/rot + deutsche Fehlererklärung; Schichten aufklappbar; Hex/ASCII mit Byte-Markierung; Follow TCP Stream (HTTP lesbar, TLS verschlüsselt); Protokollhierarchie; Legende (10 Begriffe).
- Netsim-Anbindung: nutzt `S.p.netsim.topo` + `Netsim.ping` (internes T wird gesichert/wiederhergestellt); gleiches Netz: ARP Ziel + 4× Echo; über Router: ARP Gateway, Echo an Gateway-MAC, TTL je Hop; ohne Topologie/Gateway Hinweis.
- 13 Aufgaben (Text, Auswahl, Paket anklicken, Filter finden, Netsim-Auto) → `S.p.wireshark.geloest`, `melde('wireshark',1)`, Konfetti, Toast.
- Einbindung: app.js (VERSION 2.5.0, neuerFortschritt, migrieren, Tab-Mapping, Startseite, hubWerkzeuge), index.html, motivation.js (XP 15, Quest, Abzeichen „Paketschnüffler“/„Protokoll-Detektiv“), package.json/-lock 2.5.0, CHANGELOG.

## Gesamtprüfung (alles grün)
- check-content: 640 Dateien, 0 Fehler, 0 Warnungen · build-html: dist/Netzilon-Ultra.html 5,70 MB
- test-ui: alle bestanden · test-paket: ALLES OK (inkl. neuer Abschnitt Wireshark, 30+ Prüfungen, Screenshots p5-wireshark.png / p5-wireshark-390.png, keine Konsolenfehler) · test-sqldb + test-sqlaufgaben: ALLES OK
- speicher → sql → domaene → wireshark nacheinander geöffnet, Startseite + Werkzeuge-Hub zeigen alle Werkzeuge (in test-paket).
- CSS-Präfixe: `ws-` nur in wireshark.js; spm/sql/dom/leg je nur im eigenen Modul.
- Alter Fortschritt (v2.0.0 ohne speicher/sql/domaene/wireshark) lädt per `migrieren`, Wireshark öffnet fehlerfrei.
- bauen.bat geprüft: npm install → `npm run build` (EXE) → `npm run build:html` (HTML); Skripte vorhanden – unverändert.
- Nicht committet.
