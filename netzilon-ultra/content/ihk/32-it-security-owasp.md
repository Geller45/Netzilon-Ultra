---
id: ihk-security-owasp
bereich: AP2
block: IHK
kapitel: IT-Sicherheit
titel: CIA-Triade, Authentifizierung, Hashing, TLS und OWASP Top 10
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [IT-Security-OWASP.md (Obsidian v1.0.0)]
verweise: [ihk-lz-sicherheit, ihk-infosicherheit-recht, wiso-datenschutz-dsgvo, ihk-lz-datenbank-sql]
---

## Profi

### CIA-Triade (Schutzziele)
| Schutzziel | Bedeutung | Gefahr | Maßnahme |
|---|---|---|---|
| Vertraulichkeit (Confidentiality) | nur Berechtigte sehen Daten | Abhören, Datenleck | Verschlüsselung (TLS, AES) |
| Integrität (Integrity) | Daten vollständig und unverändert | Manipulation, Man-in-the-Middle | Hashwerte, digitale Signaturen |
| Verfügbarkeit (Availability) | System nutzbar, wenn benötigt | DoS, Hardware-Ausfall | Redundanz, Backup, USV |

### Authentifizierung und Autorisierung
**Authentifizierung (AuthN)** beantwortet „Wer bist du?" (Login), **Autorisierung (AuthZ)** beantwortet „Was darfst du?" (Rechte). Erst AuthN, dann AuthZ. Faktoren: Wissen (Passwort, PIN), Besitz (Token, Smartphone-OTP), Sein (Biometrie). **MFA** kombiniert mindestens zwei verschiedene Faktoren (zwei Passwörter sind keine MFA). **RBAC** (Role-Based Access Control): Rechte hängen an Rollen, Benutzer bekommen Rollen. Vorteil: zentrale, wiederverwendbare Rechteverwaltung (entspricht dem AGDLP-Gedanken unter Windows).

### Hashing und Salting
Ein **Hash** ist eine Einwegfunktion: deterministisch, nicht umkehrbar, kollisionsresistent, kleine Eingabeänderung ergibt völlig anderen Hash. MD5 und SHA-1 sind veraltet. SHA-256/SHA-3 sind für Integrität geeignet. Für **Passwörter** nimmt man absichtlich langsame Verfahren: bcrypt, Argon2, PBKDF2. Ein **Salt** ist ein zufälliger Zusatz pro Passwort vor dem Hashen; gleiche Passwörter erzeugen verschiedene Hashes und Rainbow Tables werden nutzlos.

### TLS und HTTPS
TLS (Nachfolger von SSL) verschlüsselt die Übertragung. Handshake vereinfacht: Client Hello mit TLS-Version und Cipher-Liste, Server schickt Zertifikat und gewählten Cipher, Schlüsselaustausch (z. B. Diffie-Hellman), danach symmetrisch verschlüsselte Verbindung. HTTPS = HTTP über TLS, Port 443 (HTTP Port 80).

### OWASP Top 10 (Ausgabe 2021, in Lehrmaterial üblich)
A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection (SQL, Command, XSS), A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable and Outdated Components, A07 Identification and Authentication Failures, A08 Software and Data Integrity Failures, A09 Security Logging and Monitoring Failures, A10 Server-Side Request Forgery. Stand 2026: Die Neuausgabe 2025 ordnet die Liste um (u. a. Supply-Chain-Risiken als eigener Punkt, SSRF unter Broken Access Control); die Grundthemen bleiben, in der Prüfung zählen die Konzepte.

**SQL-Injection:** Benutzereingabe wird in den SQL-String verkettet (`' OR '1'='1`). Schutz: **Prepared Statements** (parametrisierte Abfragen), Eingabevalidierung, minimale DB-Rechte.
**XSS (Cross-Site Scripting):** Angreifer schleust Skript in eine Seite, das im Browser anderer Nutzer läuft. Schutz: Output-Encoding (`<` wird `&lt;`), Content Security Policy, HttpOnly-Cookies.
**CSRF:** Browser des angemeldeten Nutzers wird zu ungewollter Anfrage verleitet. Schutz: CSRF-Token, SameSite-Cookies. **DoS/DDoS:** Überlastung eines Dienstes. **Penetrationstest:** autorisierter Angriff zum Aufdecken von Lücken.

## Einfach

Stell dir dein Haus vor. Drei Dinge sollen stimmen: Nur du darfst hinein (Vertraulichkeit), niemand verschiebt heimlich deine Möbel (Integrität), und die Tür geht auf, wenn du heimkommst (Verfügbarkeit). Das sind die drei Schutzziele, die man CIA nennt.

An der Tür fragt der Türsteher zuerst: „Wer bist du?" Du zeigst deinen Ausweis. Das ist Authentifizierung. Danach schaut er auf die Liste: „Darfst du in den VIP-Raum?" Das ist Autorisierung. Mehrfaktor heißt: Ausweis und Fingerabdruck und ein Code aufs Handy, also verschiedene Arten von Beweisen.

Passwörter schreibt man nie offen in eine Liste. Man mischt sie durch einen Fleischwolf (Hash): Aus Hackfleisch kann man kein Steak mehr machen. Damit zwei gleiche Passwörter nicht gleich aussehen, wirft man vorher eine Prise zufälliges Gewürz dazu (Salt). Und der Fleischwolf soll langsam sein, damit Räuber nicht Millionen Versuche pro Sekunde schaffen.

TLS ist ein Geheimtunnel zwischen deinem Browser und der Webseite. Im Tunnel sieht niemand mit, was du schickst. Das Schloss in der Adresszeile zeigt ihn an.

SQL-Injection ist, wenn jemand ins Namensfeld nicht seinen Namen, sondern einen Befehl schreibt, und die Datenbank gehorcht. Mit Prepared Statements bekommt die Datenbank Befehl und Daten getrennt und führt nur den Befehl aus.

## Merksatz
- CIA = Confidentiality, Integrity, Availability.
- AuthN = wer? AuthZ = was darf?
- Hash = Einbahnstraße, Salt = Prise Zufall, bcrypt = bewusst langsam.
- HTTPS = HTTP + TLS, Port 443.
- SQL-Injection stoppt man mit Prepared Statements, XSS mit Output-Encoding.

## Prüfungsfalle
- Authentifizierung und Autorisierung vertauschen.
- Verschlüsselung und Hashing gleichsetzen: Verschlüsseln ist umkehrbar, Hashen nicht.
- Passwörter „verschlüsselt" speichern statt gesalzen gehasht.
- MD5/SHA-1 als sicher bezeichnen.
- Zwei Faktoren aus derselben Kategorie (Passwort und PIN) als MFA bezeichnen.
- SSL als aktuell nennen: SSL ist veraltet, aktuell ist TLS 1.2/1.3.
- Bei Schutzzielen Verfügbarkeit vergessen (Backup und Redundanz gehören dazu).

## Grafik
### TLS-Handshake
1. Client -> Server: Client Hello mit TLS-Version und Cipher-Liste
2. Server -> Client: Zertifikat und gewählter Cipher
3. Client: prüft das Zertifikat gegen die vertrauenswürdige CA
4. Client -> Server: Schlüsselaustausch
5. Server -> Client: Bestätigung
6. Client -> Server: verschlüsselte Daten

### SQL-Injection abwehren
1. Angreifer -> Webanwendung: Eingabe ' OR '1'='1
2. Webanwendung: verkettet String zur SQL-Abfrage (unsicher)
3. Webanwendung -> Datenbank: Abfrage liefert alle Datensätze
4. Webanwendung: nutzt stattdessen Prepared Statement
5. Webanwendung -> Datenbank: Befehl und Parameter getrennt
6. Datenbank: Eingabe wird nur als Text behandelt

## Befehle
`openssl s_client -connect host:443` – TLS-Verbindung und Zertifikat prüfen
`sha256sum datei` – SHA-256-Prüfsumme unter Linux berechnen
`Get-FileHash datei -Algorithm SHA256` – Prüfsumme unter PowerShell

## Übungen
- A: Erklären Sie, warum Passwörter gesalzen gehasht werden. | L: Hash verhindert Klartext bei Datenleck, Salt macht gleiche Passwörter unterschiedlich und Rainbow Tables nutzlos, langsamer Algorithmus (bcrypt, Argon2) bremst Brute-Force.
- A: Ordnen Sie zu: Datenleck, Manipulation, DoS. | L: Vertraulichkeit, Integrität, Verfügbarkeit.
- A: Wie schützen Sie sich vor SQL-Injection? | L: Prepared Statements, Eingabevalidierung, minimale Datenbankrechte.

## Karteikarten
- F: Drei Schutzziele? | A: Vertraulichkeit, Integrität, Verfügbarkeit.
- F: Unterschied AuthN und AuthZ? | A: Identität prüfen gegenüber Berechtigung prüfen.
- F: Drei Authentifizierungsfaktoren? | A: Wissen, Besitz, Sein.
- F: Was ist RBAC? | A: Rechtevergabe über Rollen statt einzelner Benutzer.
- F: Ist Hashing umkehrbar? | A: Nein, es ist eine Einwegfunktion.
- F: Wozu dient ein Salt? | A: Verhindert gleiche Hashes für gleiche Passwörter und macht Rainbow Tables nutzlos.
- F: Welche Verfahren für Passwort-Hashes? | A: bcrypt, Argon2, PBKDF2.
- F: Welche Hashverfahren sind veraltet? | A: MD5 und SHA-1.
- F: Port von HTTPS? | A: 443.
- F: Schutz gegen SQL-Injection? | A: Prepared Statements.
- F: Schutz gegen XSS? | A: Output-Encoding, Content Security Policy, HttpOnly-Cookies.
- F: Was ist ein Penetrationstest? | A: Autorisierter Angriff zur Aufdeckung von Schwachstellen.

## Quiz
? Welches Schutzziel verletzt ein DDoS-Angriff vor allem?
* Verfügbarkeit
- Vertraulichkeit
- Integrität
- Authentizität

? Was beschreibt Autorisierung?
* Prüfung, was ein angemeldeter Benutzer darf
- Prüfung der Identität
- Verschlüsselung der Verbindung
- Sicherung der Daten

? Wozu dient ein Salt?
* Gleiche Passwörter ergeben verschiedene Hashes
- Er verschlüsselt das Passwort umkehrbar
- Er beschleunigt den Hash
- Er ersetzt TLS

? Welcher Algorithmus ist für Passwortspeicherung geeignet?
* Argon2
- MD5
- SHA-1
- Base64

? Welche Maßnahme schützt vor SQL-Injection?
* Prepared Statements
- Längere Passwörter
- Einsatz von HTTPS
- Größere Festplatten

? Was ist XSS?
* Einschleusen von Skripten in Webseiten, die im Browser anderer Nutzer laufen
- Überlastung eines Servers
- Brute-Force auf Passwörter
- Abhören eines WLANs

? Was ist MFA?
* Kombination mindestens zweier verschiedener Faktoren
- Zwei Passwörter
- Passwort mit Sonderzeichen
- Ein Passwort, das monatlich wechselt

? Auf welchem Port läuft HTTPS?
* 443
- 80
- 22
- 25

? Welche Maßnahme sichert die Integrität?
* Hashwerte und digitale Signaturen
- Redundante Netzteile
- Zugangskontrolle am Rechenzentrum
- Spiegelung der Festplatten

? Welche Aussagen zu Hashing sind richtig? (mehrere)
* Es ist eine Einwegfunktion.
* Kleine Änderung der Eingabe ergibt völlig anderen Hash.
- Man kann den Hash mit dem Schlüssel entschlüsseln.
- MD5 gilt als besonders sicher.
