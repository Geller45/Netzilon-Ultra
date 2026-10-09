---
id: ihk-lz-dns-email
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: DNS und E-Mail – Records, SPF, DKIM, S/MIME, Phishing
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [DNS.docx, DNS.pdf, E-Mail & Protokolle.docx, E-Mail & Protokolle.pdf, Protokolle.docx, Lernzettel_AP1AP2_2024.pdf]
verweise: [ihk-lz-protokolle, ihk-fehleranalyse, ihk-lernzettel-guide]
---

## Profi

### DNS
- Weltweit verteilter Verzeichnisdienst, **Namensauflösung**: FQDN (z. B. www.google.de) → IPv4/IPv6. Port **53** (UDP, bei großen Antworten/Zonentransfer TCP). Vor jeder Verbindung startet der Client eine **DNS-Query**.
- **Rekursiv**: Client fragt den lokalen DNS-Server, der übernimmt die komplette Suche und liefert IP oder Fehler. **Iterativ**: Der lokale Server fragt nacheinander **Root → TLD → autoritativer Server**; jeder gibt einen Verweis (Referral) weiter. Caching (TTL) beschleunigt.
- **Resource Records**:

| Typ | Funktion |
|---|---|
| **A** | Hostname → IPv4 |
| **AAAA** | Hostname → IPv6 |
| **MX** | zuständiger Mailserver (mit Priorität) |
| **NS** | autoritative Nameserver der Zone |
| **CNAME** | Alias auf anderen FQDN |
| **SOA** | Zonenverwaltung (Seriennummer, Kontakt) |
| **PTR** | Reverse-Lookup IP → Name |
| **TXT** | Freitext, z. B. SPF, DKIM-Schlüssel |
- **DNSSEC**: digitale Signaturen sichern **Authentizität** und **Integrität** der DNS-Antworten gegen DNS-Redirects/Cache-Poisoning.
- **Troubleshooting**: Ping auf IP geht, auf Namen nicht → DNS-Server falsch/nicht erreichbar (`ipconfig /all`, `nslookup`); „DNS request timed out“ → DNS-Server nicht erreichbar oder Route fehlt. Mehrere A-Records = Lastverteilung/Ausfallsicherheit.

### E-Mail-Protokolle und Ports
| Protokoll | Funktion | Port | verschlüsselt |
|---|---|---|---|
| **SMTP** | Versand Server-Server | 25 | 465 (SMTPS) |
| **SMTP Submission** | Einlieferung Client → Server | 587 (STARTTLS) | |
| **IMAP** | Abruf, Mails bleiben auf dem Server | 143 | 993 |
| **POP3** | Abruf, lokal herunterladen | 110 | 995 |
| **HTTP/HTTPS** | Webmail | 80 / 443 | |
MX-Record nötig, um Mails zu empfangen.

### Absenderschutz
- **SPF**: TXT-Record, legt erlaubte Absender-IPs/Server fest. Fehlt/falsch → legitime Mails werden abgewiesen. 
- **DKIM**: digitale Signatur im Header; öffentlicher Schlüssel im DNS (TXT, Selector). `DKIM Verification Failed` = Signatur ungültig oder DNS-Eintrag fehlt.
- **DMARC**: Richtlinie (none/quarantine/reject) und Reporting bei SPF/DKIM-Fehlschlag.
- **Spam-Filter** (Kriterien): viele Empfänger (> 50), Blacklist, unbekannte Absenderdomain, Anhänge. **Sandbox** führt unbekannte Anhänge isoliert aus. Mailserver in die **DMZ**.
- **S/MIME / PGP (X.509)**: Signatur mit **privatem** Schlüssel des Absenders (Authentizität/Integrität), Verschlüsselung mit **öffentlichem** Schlüssel des Empfängers (Vertraulichkeit).
- **Phishing-Merkmale**: Dringlichkeit, Absender passt nicht zum Anzeigenamen, Link-Ziel ≠ Link-Text (Hover), .exe-Anhang.
- **Recht**: Briefgeheimnis, Administratoren dürfen Inhalte nur unter strengen Voraussetzungen einsehen.

## Einfach

**DNS = das Telefonbuch des Internets.** Du tippst „google.de“ ein. Dein Computer kennt aber nur Nummern (IP-Adressen). Also fragt er das Telefonbuch (DNS-Server): „Welche Nummer hat google.de?“ Und bekommt die Nummer zurück.

**Rekursiv oder iterativ?**
- Rekursiv: Du bittest deine Mutter: „Finde bitte die Nummer heraus.“ Sie telefoniert herum und gibt dir am Ende die fertige Nummer.
- Iterativ: Die Mutter ruft den ersten Verwalter an (Root), der sagt „frag den für .de“, dann fragt sie den, der sagt „frag Google“. Jede Stelle zeigt nur auf die nächste.

**Die Karteikarten-Typen (Records):** A = Nummer (IPv4), AAAA = lange Nummer (IPv6), MX = „Wohin soll die Post?“, CNAME = Spitzname, NS = „Wer führt dieses Buch?“, TXT = Notizzettel (für SPF), PTR = Rückwärtssuche.

**E-Mail ist wie Briefpost:** SMTP ist der Briefträger, der Briefe wegbringt. IMAP und POP3 sind die Postfächer, aus denen du Briefe holst (IMAP lässt sie dort liegen, POP3 nimmt sie mit nach Hause).

**Gefälschte Absender:** Jeder könnte „Chef“ auf den Brief schreiben. Deshalb gibt es zwei Schutzstempel:
- **SPF**: Liste im Telefonbuch: „Diese Briefträger dürfen für uns Post austragen.“
- **DKIM**: Ein Siegel auf dem Brief, das nur wir haben. Der Empfänger prüft es mit einem öffentlichen Schlüssel aus dem Telefonbuch.

**Phishing erkennen:** Wenn die Mail schnell etwas will („in 12 Stunden!“), die Adresse komisch ist oder der Link beim Darüberfahren woanders hinführt: nicht klicken.

**S/MIME:** Mit deinem privaten Schlüssel unterschreibst du, mit dem öffentlichen Schlüssel des anderen steckst du den Brief in einen Umschlag, den nur er aufmachen kann.

## Merksatz
- Rekursiv: einer macht alles. Iterativ: Weitergabe mit Verweisen.
- A = IPv4, AAAA = IPv6, MX = Mail, TXT = SPF, PTR = Rückwärts.
- SMTP 25/465/587, IMAP 143/993, POP3 110/995.
- Signieren privat, verschlüsseln öffentlich des Empfängers.
- SPF = wer darf senden, DKIM = echt und unverändert.

## Prüfungsfalle
- IMAP lässt Mails auf dem Server, POP3 lädt sie herunter: nicht vertauschen.
- SPF prüft die **Absender-IP**, DKIM prüft eine **Signatur**.
- DNS nutzt Port 53, nicht 25.
- Rekursiv/iterativ: Wer sucht? Der lokale Server (rekursiv für den Client, iterativ gegenüber den Nameservern).
- Zertifikate bei S/MIME sind X.509.

## Grafik
### Rekursive und iterative DNS-Auflösung
1. Client -> Lokaler DNS: Frage www.beispiel.de (rekursiv)
2. Lokaler DNS -> Root-Server: Wer kennt .de?
3. Root-Server -> Lokaler DNS: Verweis auf TLD-Server
4. Lokaler DNS -> TLD-Server: Wer kennt beispiel.de?
5. TLD-Server -> Lokaler DNS: Verweis auf autoritativen Server
6. Lokaler DNS -> Autoritativer Server: A-Record für www?
7. Autoritativer Server -> Lokaler DNS: IP-Adresse
8. Lokaler DNS -> Client: IP-Adresse

### SPF- und DKIM-Prüfung beim Empfang
1. Absender-Server -> Empfänger-Server: E-Mail mit DKIM-Signatur
2. Empfänger-Server -> DNS: SPF-TXT-Record und DKIM-Schlüssel abfragen
3. DNS -> Empfänger-Server: Record und öffentlicher Schlüssel
4. Empfänger-Server: Absender-IP gegen SPF prüfen, Signatur mit Schlüssel prüfen
5. Empfänger-Server: Zustellen oder ablehnen

## Spickzettel
- DNS Port 53; rekursiv/iterativ
- A, AAAA, MX, NS, CNAME, SOA, PTR, TXT
- SMTP 25/465/587, IMAP 143/993, POP3 110/995
- SPF TXT, DKIM Signatur + Schlüssel im DNS, DMARC Policy
- S/MIME: privat signieren, öffentlich (Empfänger) verschlüsseln
- Phishing: Dringlichkeit, Absender, Link-Ziel

## Zuordnen
### Record und Aufgabe
- A => IPv4-Adresse
- AAAA => IPv6-Adresse
- MX => Mailserver der Domain
- CNAME => Alias
- PTR => Reverse-Lookup
- TXT => SPF oder DKIM-Schlüssel

## Lücken
- Der Standardport für DNS ist {53}.
- IMAP nutzt verschlüsselt den Port {993}.
- Ein {SPF}-Eintrag legt fest, welche Server E-Mails für eine Domain senden dürfen.

## Karteikarten
- F: Port DNS? | A: 53
- F: Rekursive Auflösung? | A: Lokaler DNS-Server übernimmt die komplette Suche für den Client
- F: Iterative Auflösung? | A: Server fragt Root, TLD, autoritativen Server nacheinander und folgt den Verweisen
- F: Was ist ein MX-Record? | A: Zuständiger Mailserver einer Domain mit Priorität
- F: Was ist ein PTR-Record? | A: Reverse-Lookup von IP zu Name
- F: Was leistet DNSSEC? | A: Authentizität und Integrität von DNS-Antworten
- F: Port SMTP, Submission, IMAPS, POP3S? | A: 25, 587, 993, 995
- F: Was ist SPF? | A: TXT-Record mit erlaubten Absender-IPs
- F: Was ist DKIM? | A: Digitale Signatur der Mail, Schlüssel im DNS
- F: Wie funktioniert S/MIME-Verschlüsselung? | A: Mit öffentlichem Schlüssel des Empfängers verschlüsseln, mit seinem privaten entschlüsseln
- F: Phishing-Merkmale? | A: Dringlichkeit, falscher Absender, abweichendes Link-Ziel
- F: Wozu eine DMZ für Mailserver? | A: Schutz des internen Netzes bei Angriff

## Quiz
? Welchen Port nutzt DNS standardmäßig?
* 53
- 25
- 80
- 443

? Welcher DNS-Record gibt den Mailserver einer Domain an?
* MX
- A
- PTR
- CNAME

? Welcher Record ordnet einem Namen eine IPv6-Adresse zu?
* AAAA
- A
- MX
- NS

? Was prüft SPF?
* Ob der sendende Server für die Domain berechtigt ist
- Ob die Mail verschlüsselt ist
- Ob der Anhang Viren enthält
- Ob der Empfänger existiert

? Was passiert bei DKIM?
* Die Mail wird digital signiert und per öffentlichem Schlüssel im DNS geprüft
- Die Mail wird komprimiert
- Die Mail wird gelöscht
- Der Absender wird gesperrt

? Welcher Port gehört zu IMAPS?
* 993
- 143
- 465
- 995

? Wie unterscheiden sich POP3 und IMAP?
* POP3 lädt Mails meist herunter, IMAP belässt sie auf dem Server
- POP3 versendet, IMAP empfängt
- IMAP nutzt keine Ports
- Es gibt keinen Unterschied

? Womit verschlüsselt man bei S/MIME für den Empfänger?
* Mit dem öffentlichen Schlüssel des Empfängers
- Mit dem privaten Schlüssel des Absenders
- Mit dem privaten Schlüssel des Empfängers
- Mit dem öffentlichen Schlüssel des Absenders

? Was bedeutet iterative Namensauflösung?
* Der Server folgt Verweisen von Root über TLD zum autoritativen Server
- Der Client fragt alle Server selbst
- Die Namen werden verschlüsselt
- Der Server rät die Antwort
