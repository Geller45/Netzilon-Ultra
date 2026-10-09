# 2.5.0 – Paket 5 (Wireshark-Simulator)
- Neues Werkzeug „Wireshark-Simulator“ (app/wireshark.js): deterministisch erzeugte Mitschnitte „Büro-Start“ (DHCP-DORA, ARP, DNS A/AAAA mit CNAME, ICMP-Ping, TCP-Handshake, HTTP GET, HTTPS mit TLS-Client-/Server-Hello inkl. SNI, Kerberos AS/TGS, LDAP bind/search, SMB2 Negotiate/Session Setup/Tree Connect, FIN/RST), „Port-Scan“ (SYN-Scan, SYN/ACK vs. RST) und „Fehlersuche“ (NXDOMAIN, ICMP Destination unreachable, TCP-Retransmissions)
- Echte Bytes: Ethernet/IPv4/TCP/UDP/ICMP-Header korrekt aufgebaut inkl. Prüfsummen; Paketliste mit Wireshark-Farben und animierter Aufzeichnung, aufklappbare Schichten, Hex-/ASCII-Ansicht mit Feldmarkierung, Follow TCP Stream (HTTP lesbar, TLS verschlüsselt), Protokollhierarchie
- Anzeigefilter-Parser (ip.addr/src/dst, tcp/udp.port, eth.addr, Protokolle, tcp.flags.*, dns.flags.rcode, frame.number, &&/and, ||/or, !/not, Klammern, contains) mit rotem Feld und deutscher Fehlererklärung
- Mitschnitt aus dem Netzwerk-Simulator: Ping zwischen zwei Geräten der gespeicherten Topologie (ARP, ICMP Echo, über Router mit Gateway-MAC)
- 13 Aufgaben mit Auswertung (Antwort, Auswahl, Paket anklicken, Filter finden), XP, Quest, 2 Abzeichen, Legende (Mitschnitt, Anzeige- vs. Mitschnittfilter, ARP, DORA, DNS, Handshake, TLS, Port-Scan, Port-Spiegelung)

# 2.4.0 – Paket 4 (Domänen-Simulator „Meine Domäne“)
- Neues Werkzeug „Meine Domäne“: simulierte AD-Umgebung netzilon.example (NETZILON) mit DC01 (Windows Server 2025, 10.0.0.10, DNS + DHCP), OUs je Standort/Abteilung und den 100 Mitarbeitern der Firmen-DB als AD-Benutzer (Abteilung, Titel, Manager, Ausgeschiedene deaktiviert)
- GUI-Registerkarten: AD-Benutzer und -Computer (OU-Baum, Suche, Benutzer anlegen/ändern/verschieben/deaktivieren/löschen, Gruppen GG_/DL_ nach AGDLP), Gruppenrichtlinien (GPO anlegen, verknüpfen, Einstellungen, Richtlinienergebnis nach LSDOU), DNS (A/CNAME/PTR/SRV), DHCP (Bereich, DORA, Leases, Reservierungen), Freigaben/NTFS mit Rechner für effektive Rechte inkl. Erklärung, Vertrauensstellung zu partner.example
- Simulierte PowerShell (Get-/New-/Set-ADUser, Disable-/Enable-ADAccount, Move-ADObject, Gruppen, GPO, DNS, DHCP, SMB, Get-Acl, icacls, Get-ADTrust, Get-Help …) mit deutschen Fehlermeldungen, Pipeline, Tab-Vervollständigung und Verlauf – GUI und Konsole ändern denselben Zustand
- 11 Praxis-Aufgaben (leicht → schwer) mit automatischer Auswertung, Hinweisen und Musterlösung (GUI + PowerShell), XP, Quest, 2 Abzeichen, Legende (Domäne, DC, OU, AGDLP, LSDOU, DNS, DHCP, Freigabe vs. NTFS, Vertrauensstellung)
- Zustand wird gespeichert, ist zurücksetzbar und gegen kaputte Stände abgesichert

# 2.3.0 – Paket 3 (SQL-Labor)
- Neues Werkzeug „SQL-Labor“: echtes SQLite offline (sql.js 1.10.3, WebAssembly eingebettet, asm.js-Fallback) – in der .exe und in der Einzel-HTML
- Firmen-Datenbank „Netzilon GmbH“: 100 Mitarbeiter, Abteilungen, Standorte, Gehälter, Projekte, Kunden, Bestellungen, Zeiterfassung – automatisch erzeugt, zurücksetzbar, Änderungen werden gespeichert
- Editor (Strg+Enter, Verlauf, Beispiele), animierte Ergebnisse, deutsche Fehlererklärungen, ER-Diagramm + Live-Schema, SQLite↔T-SQL-Hinweise (erkennt TOP, GETDATE …)
- 60 Aufgaben leicht → schwer mit automatischer Prüfung (SELECT bis Transaktion), Hinweise, Lösung, XP, Quest, Abzeichen (SELECT *, Query-Ninja, Datenbank-Admin)
- 10 neue Themenseiten „SQL-Labor (Firmen-DB)“ mit 238 Aufgaben und T-SQL-Unterschieden

# 2.2.0 – Paket 2 (Inhalte: WiSo, Hyper-V, SAN, Speicher-Labor)
- WiSo-Prüfungstraining: 10 neue Themenseiten (BBiG, Kündigung, Schutzgesetze, Betriebsverfassung/Tarif, Sozialversicherung/Entgelt, Rechtsformen, Markt/Wirtschaftspolitik, Verträge/Verbraucherschutz, Nachhaltigkeit/DSGVO, Organisation/Kennzahlen) mit 277 Aufgaben aller Arten
- Hyper-V vertieft: Schwerpunkt verschachtelte Virtualisierung (Nested Virtualization) – Voraussetzungen, MAC-Spoofing/NAT, Dynamic-Memory-Einschränkungen, Prüfpunkte, Gen 1/Gen 2, vSwitch/VLAN, Nested-Cluster-Lab; 212 Aufgaben
- 50 Hyper-V-Praxisszenarien („Kunde meldet …“): Ticket, Analyse, Lösungsweg, Lab zum Nachstellen mit GUI UND PowerShell (Maschine je Schritt), Kontrollfragen
- SAN/Speicher vertieft: DAS/NAS/SAN, iSCSI, Fibre Channel/WWN, LUN-Masking/Zoning, MPIO, RAID, Storage Spaces, Speicherfunktionen; 206 Aufgaben
- Neues Werkzeug „Speicher-Labor“: SAN per Klick verkabeln, LUNs anlegen/maskieren, Zoning, Pfadprüfung „Was sieht Host X?“, Ausfälle simulieren (MPIO), RAID-Rebuild animiert (XOR), 12 Aufgaben mit Auswertung, XP/Quest/Abzeichen (LUN-Lotse, SAN-Architekt)
- Neuer Abschnitt „Legende“ (was, wie, wann, wo, warum) in jeder neuen Themenseite
- Vollständigkeit: 20 Ergänzungsseiten (jede Aufgabenart in jedem FiSi-Bereich mind. 3×), 488 zusätzliche Quizfragen in älteren Themenseiten (jede Themenseite ≥ 8 Karten/Fragen)
- Qualität: fachliche Korrekturen (Anomalie-Prüfung), Quiz-Distraktoren ausgeglichen (richtige Antwort nicht mehr auffällig die längste), alte Speicherstände laden weiter
- Aufgabe des Tages und Zufallsprüfungen ziehen automatisch aus dem erweiterten Pool (über 4.000 Aufgaben)

# 2.1.0 – Paket 1 (Motivation & Prüfungsmodi)
- Schwierigkeit: jede Aufgabe (Quiz, Prüfung, Lesen, Aufgabe des Tages) hat die Markierungen leicht / mittel / schwer; Vorschlag der App gestrichelt, du überschreibst; neue Rubrik „Nach Schwierigkeit“ mit Üben-Knopf
- Fortschritt als x/y (z. B. 33/77 erfolgreich) je Thema, Bereich, Prüfung/Ziel und gesamt; neue Ansicht „Fortschritt“ mit Meisterschaft in %
- Level jetzt bis 100 (neue Kurve, ca. 62.400 XP), neue Ränge bis „Netzilon-Meister (Durchgespielt)“, Abzeichen Durchgespielt/Meisterschaft 95 %
- Zufallsprüfung: 60 neue Fragen aus AP1, AP2 (inkl. WiSo), WiSo oder dem ganzen Pool; bevorzugt noch nicht gezogene Fragen; Zeitlimit und IHK-Note
- Aufgabe des Tages: alle 24 h öffnet sich ein Feld mit einer neuen Frage (365er Raster, Serie, Bonus-XP)
- Fix: Prüfungsmodus stürzte bei Zuordnen-/Reihenfolge-Aufgaben vor dem Anzeigen ab

# 2.0.0 – Netzilon Ultra (GPProductions)
- Umbenennung Netzilon -> Netzilon Ultra; alle Inhalte aus 1.x bleiben
- Inhaltsformat 2.0: Lücken, Zuordnen, Reihenfolge, Freitext, Szenario, Spickzettel, animierbare Grafik, Quiz-Quellen
- Animations-Engine, Prüfungsmodus (AP1 90 min), Dojo IHK-Fallen, Schwächenanalyse
- Kalender/Lernplan, XP/Level/Ranks/Streak/Abzeichen
- Rechner mit Rechenweg, Netzwerk-Simulator, Terminal-Trainer, Glossar, Cheat-Sheets, Druck/PDF, Spickzettel-Modus
- Eine HTML-Datei für iPhone (npm run build:html), bauen.bat baut EXE + HTML

# 1.0.1 – Paket 6a (Weltall & AP1 2026)
- Heft-Modus ersetzt durch Weltall-Modus: dunkler Raumschiff-Rahmen, Nebel, Sternenfeld mit Parallaxe und Funkeln, Sternschnuppen, Planet mit Ring und Mond, leuchtende Konsolen-LEDs
- Gespeicherter Heft-Modus wird automatisch auf Weltall umgestellt; Umschalter ◐ wechselt Tafel ↔ Weltall
- AP1 2026 Original (GWS GmbH): alle 4 Aufgaben als 2 Prüfungsseiten mit Lösungen, Rechenwegen, Merksätzen und 20 Quizfragen

# 1.0.0 – Paket 5 (Intro & Stickman)
- Start-Intro: Matrix-/Netzwerk-Regen, Domänen-Admin („FÜR KLICKI!“) verprügelt Linux-User („sudo apt install“) mit Tastatur, Tasten fliegen ab; danach GPProductions-Glaswürfel; ab 2. Start überspringbar (Klick/Leertaste/Esc), in Einstellungen abschaltbar
- Rand-Stickman läuft, sprintet, springt und klettert um den Bildschirm, gejagt vom Ticket „Drucker geht nicht“
- Ticket anklicken: 10 lustige Waffen (Tacker, Toner, Gummi-Ente, Neustart-Hammer …) werfen es zurück
- Ticket groß und lesbar (#Nr · PRIO 1 · Drucker geht nicht · Status ESKALIERT)
- Nach 2 min Inaktivität holt das Ticket auf und erwischt ihn; Stickman in Einstellungen abschaltbar

# 1.0.0 – Paket 4 (Lernspiele)
- Sechs Spiele mit deinem Lernstoff: Blitz-Quiz (3 Leben, Serien-Bonus), Memory (Frage/Antwort-Paare), Zuordnen (Befehle oder Ports), Wahr oder Falsch (60 s), Rechen-Sprint (Dual, Hex, Zweierkomplement, Subnetting), Lab-Reihenfolge
- Bereichsfilter, Bestwerte je Spiel, Tastensteuerung, Spielzähler in der Statistik

# 1.0.0 – Paket 3 (Suche & Werkzeuge)
- Volltextsuche über alle Abschnitte: Tippfehler-tolerant, Wortanfänge, Synonyme/Abkürzungen (GPO, DC, CA, USV …), Filter nach Bereich, Treffer markiert, Sprung direkt zur Stelle (Strg+K oder Strg+F)
- Rechner: IPv4-Subnetz, VLSM, IPv6 inkl. Teilnetze, Zahlensysteme, USV, RAID, Übertragungszeit – jeweils mit Rechenweg
- Befehlsreferenz: alle Befehle filterbar nach Kategorie und Text, Kopierknopf

# 1.0.0 – Paket 2 (Lernen)
- Karteikarten mit SM-2 (wie Anki): Nochmal/Schwer/Gut/Leicht, Tasten Leertaste + 1–4, neue Karten pro Tag, Intervall-Faktor und zweites Intervall einstellbar
- Quiz-Übungsmodus mit sofortiger Lösung und Erklärung (Tasten A–D, Enter)
- Prüfungssimulation mit Zeitlimit, Fragenübersicht und IHK-Notenschlüssel
- Auswahl nach Bereich/Kapitel, Pool: alle, nur falsch, nur neue
- Lab-Anleitungen als Checklisten, Übersicht aller Labs
- Statistik: gelesen, Karten, Trefferquote, Prüfungsverlauf

# 1.0.0 – Paket 1 (Gerüst)
- Inhalte aus content\ werden automatisch eingelesen (eingebaut + Ordner content\ neben der .exe)
- Profil beim ersten Start
- Startseite als Stundenplan-Übersicht
- Leseansicht mit Umschalter Profi/Einfach, Merksatz, Prüfungsfalle, LEGACY-Stempel
- Tafel-Modus (dunkel) und Heft-Modus (hell), Vollbild mit F11
- Fortschritt in fortschritt.json neben der .exe
