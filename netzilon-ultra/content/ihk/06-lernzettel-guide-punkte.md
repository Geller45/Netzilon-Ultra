---
id: ihk-lernzettel-guide
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: Lernzettel – Guide nach Punkten und Gesamtzusammenfassung AP1/AP2
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [1 Guide nach Punkten.docx, 1 Lernzettel Zusammenfassung.docx, Ergänzung Lernzettel.docx, Lernzettel_Kurzform.pdf, Lernzettel_AP1AP2_2024.pdf, Lernzettel_AP1AP2_2024.docx, Lernzettel_AP1_2024.pdf, AP1_Lernzettel_1.pdf, Abschlussprüfung_Lernzettel.pdf, zusammenfassung-Zwischenprüfung-2022.pdf]
verweise: [ihk-pruefungsaufbau, ihk-fehleranalyse, ihk-vor-nachteile, ihk-berechnungen-lernzettel, ihk-handlungsschritte]
---

## Profi

### Punkte-Schwerpunkte (Guide nach Punkten)
| Gebiet | Häufige Punkte | Typische Aufgaben |
|---|---|---|
| **Programmierung/Logik** | 15–17 | Pseudocode ergänzen, Array durchlaufen (Maximum, Mittelwert), Index-Fehler (`i <= Länge` statt `<`), Bubblesort, Prüfsummen |
| **Datenbanken/SQL** | 10–15 | `SELECT … JOIN … GROUP BY`, `CREATE TABLE` mit PK/FK, ER-Modell, Kardinalitäten, 3. NF |
| **Netzplanung/Routing** | 10–14 | Routing-Tabelle (Next-Hop vs. Interface), Subnetting (2ⁿ−2), /56 → 256 × /64, VLAN tagged/untagged |
| **IT-Sicherheit/Firewall** | 6–10 | SPI-Regeln (Protokoll, Quell-/Ziel-IP, Port: 443, 25, 993), SPF/DKIM/DMARC, S/MIME, VPN (End-to-Site vs. Site-to-Site), TLS-Handshake |
| **Datensicherung/RAID** | 6–10 | Voll/diff/inkr., RAID 5 (n−1), 6 (n−2), 10 (n/2), RTO/RPO |
| **Dokumentation/UML** | 4–8 | Aktivitätsdiagramm, Klassendiagramm (Aggregation leer, Komposition gefüllt) |
Screenshot-Aufgaben (Ressourcenmonitor, `nslookup`) bringen oft 4–6 Punkte bei geringem Schreibaufwand.

### Gesamtzusammenfassung (Kernaussagen)
1. **Netzwerk**: Hosts = 2ⁿ−2; /29 = 255.255.255.248 (6 Hosts); /30 = 2 Hosts (Router-Link); /31 nach RFC 3021 für Punkt-zu-Punkt. IPv6: Link-Local fe80::, GUA global routbar, SLAAC; /56 → 256 Subnetze /64. VLAN 802.1Q: Access untagged, Trunk tagged, Native VLAN untagged, Router-on-a-Stick mit Subinterfaces.
2. **Storage/Backup**: RAID 5 (n−1), RAID 6 (n−2), RAID 10 (n/2), RAID 15 = Spiegel + Parität; Hot-Spare; Voll/Differenziell/Inkrementell; RTO (Wiederherstellungsdauer), RPO (max. Datenverlustzeitraum); 3-2-1-Regel; GFS-Rotation; LTO mit Air Gap; Deduplizierung; JBOD ohne Redundanz.
3. **Sicherheit/Dienste**: SPI-Firewall; DNS iterativ vs. rekursiv; A, AAAA, MX, TXT, PTR; SPF (autorisierte Absender-IPs), DKIM (Signatur); S/MIME/PGP (signieren mit privatem, verschlüsseln mit öffentlichem Schlüssel des Empfängers); VPN-Ziele Vertraulichkeit, Integrität, Authentizität; Least Privilege, Zero Trust.
4. **Datenbanken/Programmierung**: PK/FK, Kardinalitäten 1:1/1:n/m:n, JOIN/GROUP BY/ORDER BY; Schleifen, IndexOutOfRange, Kapselung, Vererbung; Syntax- vs. Semantikfehler; White-/Black-Box.
5. **Hardware/Strom**: USV VFD (Offline), VI (Line-Interactive), VFI (Online/Doppelwandler); Laufzeit aus Kapazität und Last; Bottlenecks im Ressourcenmonitor; User-CAL vs. Device-CAL; Patch/Update/Upgrade.
6. **Datenschutz/WiSo**: Zweckbindung, Datenminimierung, Löschfristen; TOM (Zutritt, Zugang, Zugriff); Kündigungsschutz (personen-, verhaltens-, betriebsbedingt); Sozialversicherung RV, KV, AV, PV, UV.
- **Berechnungstipp**: Zeit t = s/v; Byte → Bit × 8; Protokoll-Overhead (oft 10 %) ×1,1.

### Ergänzungen
Server-Auswahl nach Bottleneck (DB: NVMe + RAM; Virtualisierung: CPU-Kerne + RAM), BIOS/UEFI-Sicherheit (Secure Boot, USB sperren, Boot-Reihenfolge), Mix-and-Match (Platten verschiedener Chargen), Task-Scheduler `SCHTASKS /Create /sc /tr /st`, MDM (Remote Wipe, BYOD), Malware-Typen (Virus, Wurm, Trojaner, Ransomware), White-/Black-Hat, X.509-Zertifikate, Cloud (SaaS, PaaS, IaaS), Hypervisor Typ 1/2, Skalierung horizontal/vertikal, Blue-Green-Deployment, Container teilen den OS-Kern, `chmod 664`, Dateitypen `-`, `d`, `l`, Indexierung/Locking, Badewannenkurve.

## Einfach

Stell dir die Prüfung wie ein **Videospiel mit Bossen** vor. Jeder Boss hat ein paar Standardangriffe. Wenn du sie kennst, gewinnst du fast immer.

- **Boss Programmieren (viele Punkte!)**: Eine Liste von Zahlen (Array). Du sollst die größte finden oder den Durchschnitt. Der häufigste Fehler im Code: Die Schleife läuft ein Feld zu weit.
- **Boss Datenbank**: Zwei Tabellen verbinden (JOIN), gruppieren und zählen. Außerdem: Wie hängen die Tabellen zusammen? (1:n heißt: Ein Kunde hat viele Bestellungen.)
- **Boss Netzwerk**: IP-Adressen zerlegen, Router-Tabellen füllen, VLANs ausfüllen. Hier brauchst du Rechenregeln.
- **Boss Sicherheit**: Firewall-Regeln als Tabelle schreiben. E-Mail sicher machen (SPF und DKIM sind Anti-Fälschungs-Stempel).
- **Boss Backup**: Wie viele Platten bleiben nutzbar? Wie oft sichern? Wie lange darf die Wiederherstellung dauern?
- **Boss Diagramme**: Kästchen und Pfeile.

**Dein Plan:** Erst die Standardangriffe lernen (Tabelle oben), dann alte Prüfungsaufgaben üben. Dabei immer fragen: Welcher Boss ist das?

Und noch: Ein Screenshot vom Computer (Ressourcenmonitor) ist ein **Bonusrätsel**: Welche Anzeige steht fast auf 100 %? Das ist der Flaschenhals. 4–6 Punkte für zwei Sätze.

**Eselsbrücken:** RAID 5 = ein Platz weniger (n−1), RAID 6 = zwei weniger, RAID 10 = halb. Differenziell = alles seit dem Vollbackup, inkrementell = nur das Neueste seit der letzten Sicherung. Private Schlüssel = Unterschrift, öffentlicher Schlüssel des Empfängers = Briefumschlag zum Zukleben.

## Merksatz
- Programmierung bringt am meisten Punkte, dann Datenbank, dann Netz.
- Signieren = mein privater Schlüssel, Verschlüsseln = öffentlicher Schlüssel des Empfängers.
- Differenziell wächst, inkrementell ist klein, aber Restore dauert länger.
- 2ⁿ−2, n−1, n−2, n/2: die vier Rechenregeln.

## Prüfungsfalle
- Index-Fehler: `i <= array.Length` statt `i < array.Length`.
- Bei Routing-Tabelle: Next-Hop (IP des nächsten Routers) und Interface (lokaler Port) nicht vermischen.
- RAID mit Hot-Spare: Spare-Platte zuerst abziehen.
- Signieren und Verschlüsseln nicht vertauschen.
- Bytes in Bit (×8) und Overhead (×1,1) bei Transferzeit.

## Grafik
### Signieren und Verschlüsseln (S/MIME)
1. Meier -> Anton: öffentlicher Schlüssel
2. Anton -> Meier: öffentlicher Schlüssel
3. Meier: signiert die Mail mit eigenem privaten Schlüssel
4. Meier: verschlüsselt mit öffentlichem Schlüssel von Anton
5. Meier -> Anton: signierte und verschlüsselte Mail
6. Anton: entschlüsselt mit eigenem privaten Schlüssel
7. Anton: prüft Signatur mit öffentlichem Schlüssel von Meier

## Spickzettel
- Hosts 2ⁿ−2, /30 = 2 Hosts, /29 = 6 Hosts
- /56 → 256 × /64
- RAID 5 n−1, RAID 6 n−2, RAID 10 n/2
- RTO = Dauer, RPO = Datenverlust
- Signatur: privater Schlüssel Sender; Verschlüsselung: öffentlicher Schlüssel Empfänger
- SPF TXT-Eintrag, DKIM Signatur
- Schleifen: i < Länge, nicht i <= Länge

## Reihenfolge
### Signierte und verschlüsselte Mail
1. Öffentliche Schlüssel austauschen
2. Mail mit privatem Schlüssel des Senders signieren
3. Mail mit öffentlichem Schlüssel des Empfängers verschlüsseln
4. Mit privatem Schlüssel des Empfängers entschlüsseln
5. Signatur mit öffentlichem Schlüssel des Senders prüfen

## Karteikarten
- F: Welche Themen bringen in der AP am meisten Punkte? | A: Programmierung/Logik (15–17), Datenbanken (10–15), Netzplanung (10–14)
- F: RAID 5 Kapazität? | A: (n−1) × Plattengröße
- F: RAID 6 Kapazität? | A: (n−2) × Plattengröße
- F: RAID 10 Kapazität? | A: n/2 × Plattengröße
- F: Was ist RTO? | A: Recovery Time Objective: Zeit bis zur Wiederherstellung
- F: Was ist RPO? | A: Recovery Point Objective: maximal tolerierter Datenverlustzeitraum
- F: Wofür steht SPF? | A: DNS-TXT-Eintrag, der die erlaubten Absender-IPs festlegt
- F: Wofür steht DKIM? | A: Digitale Signatur im Mail-Header zur Authentizität
- F: Wie viele /64-Netze in einem /56? | A: 256
- F: Nutzbare Hosts im /29? | A: 6
- F: USV-Typen? | A: VFD (Offline), VI (Line-Interactive), VFI (Online)
- F: User-CAL vs. Device-CAL? | A: Pro Benutzer (viele Geräte) vs. pro Gerät (Schichtbetrieb)

## Quiz
? Welches Thema bringt in der Prüfung meist die höchste Einzelpunktzahl?
* Programmierung und Logik
- Brandschutz
- Mutterschutz
- Marketing

? Wie berechnet man die Nettokapazität von RAID 6?
* (n−2) × Plattengröße
- (n−1) × Plattengröße
- n/2 × Plattengröße
- n × Plattengröße

? Wofür steht RTO?
* Zeit bis zur Wiederherstellung
- Maximaler Datenverlust
- Zufallszahl
- Schutzstufe

? Womit signiert man eine E-Mail bei S/MIME?
* Mit dem eigenen privaten Schlüssel
- Mit dem öffentlichen Schlüssel des Empfängers
- Mit dem öffentlichen Schlüssel des Absenders
- Mit einem symmetrischen Schlüssel

? Womit verschlüsselt man eine E-Mail für den Empfänger?
* Mit dem öffentlichen Schlüssel des Empfängers
- Mit dem eigenen privaten Schlüssel
- Mit dem privaten Schlüssel des Empfängers
- Gar nicht

? Wie viele /64-Subnetze enthält ein /56-Präfix?
* 256
- 64
- 1.024
- 65.536

? Was ist ein klassischer Schleifenfehler beim Array-Durchlauf?
* i <= Länge statt i < Länge
- i++ statt i--
- Zu viele Variablen
- Fehlende Kommentare

? Was sichert ein inkrementelles Backup?
* Änderungen seit der letzten Sicherung (egal welcher)
- Alle Daten
- Änderungen seit dem letzten Vollbackup
- Nur gelöschte Dateien

? Welche USV schützt vollständig ohne Umschaltzeit?
* VFI (Online)
- VFD (Offline)
- VI (Line-Interactive)
- Keine

? Wie viele Hosts gibt es im /30?
* 2
- 4
- 6
- 30
