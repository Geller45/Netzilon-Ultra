---
id: ihk-fehleranalyse
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: Fehleranalyse – Programmierfehler, Netzwerk-Troubleshooting, TLS- und Mail-Fehler
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [Fehler-Analyse.docx, Fehler-Analyse.pdf, Ergänzung Lernzettel.docx, Lernzettel_AP1AP2_2024.pdf, AP1_Lernplan_1.pdf]
verweise: [ihk-lernzettel-guide, ihk-berechnungen-lernzettel]
---

## Profi

### 1. Programmierfehler
- **Syntaxfehler**: Verstoß gegen Sprachregeln (fehlendes Semikolon, Klammer), vom Compiler erkannt.
- **Semantikfehler (Logikfehler)**: Programm läuft, Ergebnis falsch (falsche Formel, Zuweisung, Vergleichsoperator).
- **Laufzeitfehler (Exceptions)**: `IndexOutOfRangeException` (Zugriff außerhalb der Array-Grenzen, typisch `i <= anzahl` statt `i < anzahl`), Division durch null, Datei fehlt, falscher Datentyp bei Eingabe.
- **Werkzeug**: **Trace-Tabelle / Schreibtischtest**: Variablen (z. B. `max`, `max2`) Schritt für Schritt in einer Tabelle nachverfolgen. Typische Logikfehler: Endlosschleife, Off-by-One, nicht initialisierte Variable, vertauschte Bedingung.

### 2. Netzwerk-Troubleshooting
| Tool | Zweck | Interpretation |
|---|---|---|
| `ping` | Erreichbarkeit/Latenz | „Zeitüberschreitung“: Firewall blockt ICMP, falsches Routing oder Host aus |
| `nslookup` | DNS-Auflösung | „DNS request timed out“: DNS-Server nicht erreichbar oder fehlende Route |
| `tracert`/`traceroute` | Weg der Pakete | `* * *` an einem Hop: Routingfehler oder Firewall |
| `ipconfig`/`ip a` | IP-Konfiguration | **169.254.x.x (APIPA)**: kein DHCP-Server erreicht |
| `netstat`/`ss` | offene Ports/Verbindungen | |
Weitere Ursachen: **DHCP-Fehlschlag** durch falsche VLAN-Konfiguration oder blockierte Ports am L3-Switch; **STP** blockiert Ports zur Loop-Vermeidung; falsches Gateway oder Subnetzmaske; doppelte IP.
Vorgehen (Bottom-up nach OSI): Kabel/Link → IP/Gateway → DNS → Dienst/Port → Anwendung.

### 3. Performance und Hardware
- **Bottleneck** aus Ressourcenmonitor: CPU nahe 100 %, RAM nahe 100 % (Auslagerung), Datenträger-Warteschlange hoch, Netzwerk 100 Mbit/s statt 1 Gbit/s (falscher Treiber/Kabel/Duplex).
- **Badewannenkurve**: I Frühausfälle (Fertigungsfehler), II konstante zufällige Ausfälle (Nutzungsdauer), III Verschleißausfälle (Alterung).
- **MTBF** (Mean Time Between Failures, reparierbare Systeme) und **MTTF** (Mean Time To Failure, nicht reparierbare Komponenten wie Festplatten); **MTTR** (Mean Time To Repair). Verfügbarkeit = MTBF : (MTBF + MTTR).

### 4. TLS/Zertifikatsfehler (Browser)
| Meldung | Bedeutung |
|---|---|
| `SEC_ERROR_UNKNOWN_ISSUER` | Zertifikat von unbekannter/nicht vertrauter CA (Root/Zwischenzertifikat fehlt) |
| `SEC_ERROR_EXPIRED_ISSUER_CERTIFICATE` | Zertifikat der CA abgelaufen |
| `SSL_ERROR_VERSION_OR_CIPHER_MISMATCH` | keine gemeinsame TLS-Version/Cipher-Suite |
Weitere: Zertifikat abgelaufen, Name passt nicht (CN/SAN), Zertifikat widerrufen (CRL/OCSP).

### 5. Mail-Logs
- `DKIM Verification Failed`: Signatur passt nicht zum öffentlichen Schlüssel im DNS (TXT-Record, Selector).
- `554 5.7.1 … BLOCKLIST_SENDER_DOMAIN`: Absenderdomain steht auf Sperrliste, Zustellung verweigert.
- SPF-Fehler: sendender Server nicht im SPF-Record; DMARC definiert Behandlung bei Fehlschlag.

### 6. Symptome einer Kompromittierung
Unbekannte Prozesse, ungewöhnliche Netzwerklast, träge Reaktion, unbekannte Benutzerkonten, geänderte Dateien, deaktivierter Virenschutz.

## Einfach

Fehlersuche ist wie **Detektivarbeit**. Du bekommst Hinweise (Fehlermeldungen) und musst den Täter finden.

**Im Programm:**
- **Syntaxfehler** = Tippfehler, der Computer meckert sofort („Das ist kein richtiger Satz!“).
- **Logikfehler** = Der Satz ist richtig, aber falsch gemeint. Wie wenn du „plus“ statt „minus“ rechnest: Das Programm läuft, aber das Ergebnis ist falsch.
- **Index-Fehler**: Ein Regal hat 5 Fächer (0 bis 4). Wenn du Fach Nummer 5 aufmachst, gibt es das nicht. Das passiert, wenn die Schleife `<=` statt `<` hat.
- **Schreibtischtest**: Du spielst den Computer. Du schreibst jede Variable in eine Tabelle und ändert sie Schritt für Schritt.

**Im Netzwerk:** Frage dich: Kommt das Signal überhaupt an?
1. `ipconfig`: Habe ich eine Adresse? Wenn sie mit **169.254** beginnt, hat mich niemand freundlich gegrüßt: DHCP nicht erreicht.
2. `ping` zum Gateway: Ist der Router da?
3. `ping` auf eine IP im Internet: Läuft die Route nach draußen?
4. `nslookup`: Kann ich Namen in Adressen übersetzen (DNS)?
5. `tracert`: Wo bleibt das Paket hängen? (Sternchen = hier ist die Straße gesperrt.)

**Sicherer Link (Schloss im Browser):** Der Browser fragt: „Wer hat dir dieses Zertifikat ausgestellt? Kenne ich den?“ „UNKNOWN_ISSUER“ heißt: Kenn ich nicht. „EXPIRED“ heißt: Der Ausweis ist abgelaufen. „VERSION_OR_CIPHER_MISMATCH“: Wir sprechen nicht dieselbe Geheimsprache.

**Badewannenkurve:** Neue Geräte fallen am Anfang manchmal aus (Fehler vom Hersteller), dann laufen sie lange ruhig, am Ende altern sie und fallen wieder öfter aus. Wie ein Fahrrad.

## Merksatz
- Syntax = Form, Semantik = Sinn.
- 169.254.x.x = kein DHCP.
- Sterne im tracert = hier hakt es.
- Badewanne: früh, zufällig, Verschleiß.
- Flaschenhals = die Anzeige auf 100 %.

## Prüfungsfalle
- `<=` vs. `<` bei Array-Schleifen.
- Ping-Timeout heißt nicht automatisch „Host aus“. Auch ICMP-Blockade kann es sein.
- MTBF (reparierbar) vs. MTTF (nicht reparierbar) nicht vertauschen.
- Bei Zertifikatsfehlern prüfen: Name, Gültigkeit, Aussteller.
- Bei Screenshot-Aufgaben: Zahl nennen (z. B. „CPU 100 %“), dann Schluss ziehen.

## Grafik
### Netzwerkfehler eingrenzen
1. Client: ipconfig zeigt 169.254.x.x
2. Client -> DHCP-Server: DHCP Discover bleibt unbeantwortet
3. Administrator: VLAN und Switchport prüfen
4. Client -> Router: ping Gateway
5. Client -> DNS-Server: nslookup prüft Namensauflösung
6. Administrator: tracert zeigt Hop mit Sternchen, dort Firewall oder Route prüfen

## Spickzettel
- Syntax/Semantik/Laufzeit; i < Länge
- APIPA 169.254 = kein DHCP
- ping, nslookup, tracert, ipconfig
- Badewanne: Früh, Zufall, Verschleiß
- MTBF reparierbar, MTTF nicht
- UNKNOWN_ISSUER, EXPIRED_ISSUER, VERSION_OR_CIPHER_MISMATCH
- DKIM failed = Signatur ≠ DNS-Schlüssel

## Zuordnen
### Fehlermeldung und Ursache
- 169.254.x.x => Kein DHCP-Server erreicht
- SEC_ERROR_UNKNOWN_ISSUER => Unbekannte CA
- DKIM Verification Failed => Signatur passt nicht zum DNS-Schlüssel
- IndexOutOfRangeException => Zugriff außerhalb der Array-Grenzen
- Stern im tracert => Routing-/Firewall-Problem am Hop

## Karteikarten
- F: Syntaxfehler vs. Semantikfehler? | A: Syntax: Sprachregel verletzt, vom Compiler erkannt; Semantik: läuft, falsches Ergebnis
- F: Typischer Index-Fehler? | A: i <= anzahl statt i < anzahl
- F: Was bedeutet 169.254.x.x? | A: APIPA: kein DHCP-Server erreichbar
- F: Was zeigt tracert? | A: Weg der Pakete; Sterne = Hänger durch Routing oder Firewall
- F: Badewannenkurve Phasen? | A: Frühausfälle, zufällige Ausfälle, Verschleißausfälle
- F: MTBF vs. MTTF? | A: MTBF reparierbare Systeme; MTTF nicht reparierbare Komponenten
- F: UNKNOWN_ISSUER? | A: Zertifikat von unbekannter CA
- F: VERSION_OR_CIPHER_MISMATCH? | A: Keine gemeinsame TLS-Version oder Cipher-Suite
- F: DKIM Verification Failed? | A: Signatur stimmt nicht mit DNS-Schlüssel überein
- F: Wozu dient eine Trace-Tabelle? | A: Variablenwerte schrittweise nachvollziehen (Schreibtischtest)

## Quiz
? Was bedeutet eine IP-Adresse 169.254.10.5 auf einem Client?
* Kein DHCP-Server wurde erreicht (APIPA)
- Statische Konfiguration
- Öffentliche Adresse
- Loopback

? Welche Meldung bedeutet unbekannte Zertifizierungsstelle?
* SEC_ERROR_UNKNOWN_ISSUER
- SSL_ERROR_VERSION_OR_CIPHER_MISMATCH
- 554 5.7.1
- DKIM passed

? Was ist ein Semantikfehler?
* Programm läuft, aber das Ergebnis ist falsch
- Fehlendes Semikolon
- Datei fehlt
- Speicher voll

? Was ist die Ursache einer IndexOutOfRangeException?
* Zugriff auf ein Array-Element außerhalb der Grenzen
- Fehlender Treiber
- Zu langsames Netz
- Falsches Passwort

? Wofür steht MTTF?
* Mittlere Zeit bis zum Ausfall einer nicht reparierbaren Komponente
- Mittlere Reparaturzeit
- Mittlere Zeit zwischen Ausfällen eines reparierbaren Systems
- Maximale Übertragungsrate

? Welcher Bereich der Badewannenkurve beschreibt Alterung?
* Verschleißausfälle
- Frühausfälle
- Zufallsausfälle
- Wartungsausfälle

? Wie interpretiert man „Zeitüberschreitung der Anforderung“ bei ping?
* Mögliche Ursachen: Firewall, falsches Routing oder Host ausgefallen
- Der Host ist sicher defekt
- DNS ist ausgefallen
- DHCP ist aktiv

? Wozu dient eine Trace-Tabelle?
* Schrittweise Verfolgung der Variablenwerte
- Netzwerktopologie zeichnen
- Datenbank normalisieren
- Strom messen

? Was bedeutet „DKIM Verification Failed“?
* Die Signatur passt nicht zum öffentlichen Schlüssel im DNS
- Der Empfänger ist voll
- SPF ist deaktiviert
- Spam wurde erkannt

? Was beschreibt MTBF?
* Mittlere Zeit zwischen Ausfällen eines reparierbaren Systems
- Zeit bis zum Totalausfall einer Festplatte
- Zeit der Wiederherstellung
- Reaktionszeit
