---
id: ihk-glossar-sicherheit
bereich: AP1
block: IHK
kapitel: Glossar
titel: Glossar IT-Sicherheit, Verschlüsselung und Datenschutz (Abkürzungen A-Z)
stufe: Einsteiger
fach: PV – AP1
pruefungen: [AP1, AP2]
quellen: [Abkürzungsverzeichnis.md (Obsidian FI Ausbildung-Themen, Version 1.0.0), Themen-Beziehungskarte.md]
verweise: [ihk-fachbegriffe-technik, ihk-fachbegriffe-betrieb-security]
---

## Profi

IT-Sicherheit ist in AP1 und AP2 Dauerthema. Dieses Glossar sammelt Schutzziele, Verfahren, Angriffe, Normen und Datenschutzbegriffe, die in Aufgabentexten ohne Erklärung vorkommen. Das Glossar enthält 65 Einträge, alphabetisch, jeweils mit Auflösung und Kurzerklärung.

| Kürzel | Bedeutung | Erklärung |
|---|---|---|
| AES | Advanced Encryption Standard | Symmetrisches Verschlüsselungsverfahren, aktueller Standard (löst DES/3DES ab); u. a. Basis von WPA2/WPA3 (als CCMP) und BitLocker. |
| AuthN | Authentication | Authentifizierung Nachweis der Identität („wer bist du?"). Vorstufe zur Autorisierung (AuthZ). |
| AuthZ | Authorization | Autorisierung Prüfung, welche Rechte eine bereits authentifizierte Identität hat („was darfst du?"). |
| AVV | Auftragsverarbeitungsvertrag | (Art. 28 DSGVO) Verpflichtender Vertrag zwischen Verantwortlichem und Auftragsverarbeiter, wenn personenbezogene Daten im Auftrag verarbeitet werden (z. B. Cloud-Anbieter). |
| BDSG | Bundesdatenschutzgesetz | Nationales deutsches Datenschutzgesetz; ergänzt/konkretisiert die DSGVO dort, wo diese Öffnungsklauseln vorsieht. Vertiefung: BDSG |
| BSI | Bundesamt für Sicherheit in der Informationstechnik | Deutsche Cybersicherheitsbehörde; u. a. Herausgeber des IT-Grundschutzkompendiums. Vertiefung: BSI |
| BSIG | BSI-Gesetz | Gesetz über das Bundesamt für Sicherheit in der Informationstechnik Rechtsgrundlage für Aufgaben und Befugnisse des BSI. |
| CCMP | Counter Mode CBC-MAC Protocol | Verschlüsselungsprotokoll auf Basis von AES, verwendet in WPA2 (Ersatz für das unsichere TKIP). |
| CIA | Confidentiality, Integrity, Availability | Vertraulichkeit, Integrität, Verfügbarkeit Die drei klassischen Grundschutzziele der IT-Sicherheit (CIA-Triade). |
| CSP | Content Security Policy | HTTP-Header, der einschränkt, aus welchen Quellen ein Browser Skripte/Styles/Ressourcen laden darf - Schutz u. a. gegen XSS. |
| CSRF | Cross-Site Request Forgery | Angriff, bei dem ein Opfer unwissentlich eine Aktion auf einer fremden, authentifizierten Seite ausführt (z. B. über ein manipuliertes Formular). |
| CVE | Common Vulnerabilities and Exposures | Öffentlicher Katalog eindeutig referenzierbarer, bekannter Sicherheitslücken. |
| DDoS | Distributed Denial of Service | Überlastungsangriff aus vielen verteilten Quellen gleichzeitig (Botnet) - im Gegensatz zum einfachen DoS (eine Quelle). |
| DES | Data Encryption Standard | Älterer, heute unsicherer symmetrischer Verschlüsselungsalgorithmus (56-Bit-Schlüssel); durch AES abgelöst. |
| DMARC | Domain-based Message Authentication, Reporting and Conformance | E-Mail-Standard, der auf Basis von SPF und DKIM festlegt, wie mit nicht-authentifizierten Mails einer Domain zu verfahren ist - Schutz gegen Absender-Spoofing. |
| DoS | Denial of Service | Überlastungsangriff aus einer einzelnen Quelle. Verteilt: siehe DDoS. |
| DSB | Datenschutzbeauftragter | Muss von Unternehmen bestellt werden, wenn gesetzliche Kriterien erfüllt sind (Art. 37 DSGVO); überwacht die Einhaltung des Datenschutzes. |
| DSGVO | Datenschutz-Grundverordnung | General Data Protection Regulation (GDPR) EU-Verordnung zum Schutz personenbezogener Daten; gilt seit 25.05.2018 unmittelbar in allen Mitgliedstaaten. Kernpflichten: Rechtsgrundlage, Zweckbindung, Betroffenenrechte, TOM nach Art. 32. Vertiefung: DSGVO |
| ECC | Elliptic Curve Cryptography | Asymmetrisches Kryptografieverfahren auf Basis elliptischer Kurven - vergleichbare Sicherheit zu RSA bei deutlich kürzeren Schlüsseln. |
| eIDAS | electronic IDentification, Authentication and trust Services | EU-Verordnung für elektronische Identifizierung und Vertrauensdienste (u. a. rechtliche Grundlage der qualifizierten elektronischen Signatur, QES). |
| EU | Europäische Union |  |
| EWR | Europäischer Wirtschaftsraum | Erweitert den EU-Binnenmarkt um Island, Liechtenstein und Norwegen; relevant für die Frage, ob ein Datentransfer als „Drittlandtransfer" nach DSGVO gilt. |
| FDE | Full Disk Encryption | Vollständige Verschlüsselung eines Datenträgers (z. B. via TPM/BitLocker), schützt Daten bei physischem Diebstahl. |
| GG | Grundgesetz | Deutsche Verfassung; u. a. Grundlage für Grundrechte, die auch im Arbeits-/Datenschutzrecht wirken. |
| IAM | Identity and Access Management | Prozesse und Systeme zur Verwaltung digitaler Identitäten und ihrer Zugriffsrechte. |
| ICS | Industrial Control System | Steuerungssysteme für industrielle Prozesse/Anlagen (z. B. SCADA); typisches Ziel gezielter Cyberangriffe auf KRITIS. |
| IEC | International Electrotechnical Commission | Internationale Normungsorganisation für Elektrotechnik/Elektronik; zusammen mit der ISO Herausgeberin u. a. der ISO/IEC-27000-Reihe. |
| IPsec | Internet Protocol Security | Protokollsammlung zur Verschlüsselung/Authentifizierung von IP-Verkehr - häufige Grundlage von Site-to-Site-VPNs. |
| ISB | Informationssicherheitsbeauftragter | Verantwortet die Umsetzung und Steuerung der Informationssicherheit im Unternehmen (zentrale Rolle im ISMS). |
| ISMS | Informationssicherheits-Managementsystem | Systematischer, dokumentierter Ansatz zur Steuerung der Informationssicherheit einer Organisation (Planung, Umsetzung, Kontrolle, Verbesserung); nach ISO 27001 zertifizierbar. Vertiefung: ISMS |
| ISO 27001 | ISO/IEC 27001 | International anerkannte, zertifizierbare Norm für Informationssicherheits-Managementsysteme (ISMS); folgt dem Plan-Do-Check-Act-Zyklus. Vertiefung: ISO 27001 |
| IT-SiG | IT-Sicherheitsgesetz | Deutsches Gesetz zur Erhöhung der Sicherheit informationstechnischer Systeme, insbesondere für KRITIS-Betreiber; verpflichtet zu Mindeststandards und Meldepflichten bei Sicherheitsvorfällen. IT-SiG 2.0 (2021) weitete den KRITIS-Sektor aus und stärkte die Rolle des BSI (u. a. als NCCA). Vertiefung: IT-SiG |
| JWT | JSON Web Token | Kompaktes, signiertes Token-Format zum sicheren Austausch von Claims, häufig zur zustandslosen Authentifizierung bei APIs. |
| KRITIS | Kritische Infrastrukturen | Einrichtungen (Energie, Gesundheit, Wasser, IT/TK, …), deren Ausfall erhebliche Auswirkungen auf das Gemeinwesen hätte - unterliegen verschärften Sicherheitsanforderungen nach IT-SiG. |
| KVP | Kontinuierlicher Verbesserungsprozess | Fortlaufende, iterative Verbesserung von Prozessen (z. B. zentrales Prinzip eines ISMS nach ISO 27001, siehe auch PDCA). |
| MFA | Multi-Faktor-Authentifizierung | Authentifizierung über mindestens zwei unabhängige Faktoren (Wissen, Besitz, Inhärenz) - deutlich sicherer als reine Passwort-Anmeldung. |
| MITM | Man-in-the-Middle | Angriff, bei dem sich der Angreifer unbemerkt zwischen zwei Kommunikationspartner schaltet und Daten mitliest/manipuliert. |
| NCCA | Nationale Behörde für Cybersicherheitszertifizierung | (National Cybersecurity Certification Authority) Rolle des BSI im Rahmen der EU-Cybersicherheitszertifizierung. |
| PGP | Pretty Good Privacy | Verschlüsselungs-/Signaturprogramm, klassisches Beispiel hybrider Verschlüsselung (asymmetrisch + symmetrisch) für E-Mails. |
| PII | Personally Identifiable Information | personenbezogene Daten Englischer Fachbegriff, entspricht dem DSGVO-Begriff „personenbezogene Daten". |
| PIN | Persönliche Identifikationsnummer |  |
| PSK | Pre-Shared Key | Vorab zwischen den Parteien vereinbarter, gemeinsamer geheimer Schlüssel (z. B. bei WPA2-Personal). |
| QES | Qualifizierte elektronische Signatur | Höchste Vertrauensstufe der elektronischen Signatur nach eIDAS; hat Schriftformwirkung (§ 126a BGB). |
| RBAC | Role-Based Access Control | Berechtigungen werden Rollen zugewiesen, Benutzer erhalten Rollen - nicht Einzelrechte. Wirkt auf der Ebene Zugriff (nicht Zugang). |
| RSA | Rivest-Shamir-Adleman | Weit verbreitetes asymmetrisches Verschlüsselungsverfahren, benannt nach seinen Erfindern. |
| SAML | Security Assertion Markup Language | XML-basierter Standard für Single Sign-On (SSO) zwischen Identitätsanbieter und Diensten. |
| SHA | Secure Hash Algorithm | Familie kryptografischer Hashfunktionen (z. B. SHA-256) zur Erzeugung von Prüfsummen/digitalen Signaturen. |
| SPF | Sender Policy Framework | E-Mail-Standard: legt fest, welche Server im Namen einer Domain Mails versenden dürfen - Schutz gegen Absender-Spoofing. |
| SSL | Secure Sockets Layer | Älteres Verschlüsselungsprotokoll, Vorläufer von TLS (gilt heute als unsicher/veraltet, Begriff wird oft noch synonym für TLS verwendet). |
| SSO | Single Sign-On | Einmalige Anmeldung, die Zugriff auf mehrere unabhängige Systeme/Anwendungen gewährt. |
| StGB | Strafgesetzbuch | Regelt in Deutschland, welches Verhalten strafbar ist (relevant u. a. bei Datenausspähung, Computerbetrug). |
| TAN | Transaktionsnummer | Einmalpasswort zur Freigabe einzelner Transaktionen (klassisch im Online-Banking). |
| TKG | Telekommunikationsgesetz | Reguliert den Telekommunikationssektor in Deutschland; u. a. relevant für Datenschutz bei TK-Diensten. |
| TKIP | Temporal Key Integrity Protocol | Älteres, heute unsicheres WLAN-Verschlüsselungsprotokoll (WPA), durch CCMP/AES (WPA2) abgelöst. |
| TLS | Transport Layer Security | Verschlüsselungsprotokoll für sichere Verbindungen (Nachfolger von SSL); Grundlage von HTTPS. |
| TMG | Telemediengesetz | Regelte u. a. Impressumspflicht und Datenschutz bei Telemedien in Deutschland (inzwischen weitgehend im Digitale-Dienste-Gesetz/TTDSG aufgegangen, im IT-SiG-Kontext noch als Referenz relevant). |
| TOM | Technisch-organisatorische Maßnahmen | Technical and Organizational Measures Nach Art. 32 DSGVO verpflichtende Schutzmaßnahmen: technisch (Verschlüsselung, RBAC, Backup, Firewall) und organisatorisch (Richtlinien, Schulungen, Rollenkonzept). Vertiefung: Notiz TOM noch ohne Inhalt → siehe Notizen ohne Inhalt |
| TPM | Trusted Platform Module | Hardware-Sicherheitschip, der kryptografische Schlüssel sicher speichert - Grundlage u. a. für Festplattenverschlüsselung (FDE/BitLocker) und Boot-Integrität. |
| VCIA | Merkwort | für die vier IT-Schutzziele: Vertraulichkeit, Confidentiality/Integrität, Integrity, Availability/Verfügbarkeit - deutsch-englische Merkhilfe, ergänzt um Authentizität. Deutsche Variante: VIVA. |
| WAF | Web Application Firewall | Spezialisierte Firewall, die HTTP(S)-Verkehr auf Anwendungsebene filtert (Schutz u. a. gegen SQL-Injection, XSS). |
| WEP | Wired Equivalent Privacy | Ältestes, heute als unsicher geltendes WLAN-Verschlüsselungsverfahren. |
| WPA | Wi-Fi Protected Access | WLAN-Sicherheitsstandard, Nachfolger von WEP; nutzt TKIP (inzwischen ebenfalls veraltet). |
| WPA2 | Wi-Fi Protected Access 2 | Deutlich sichererer WLAN-Standard, nutzt AES/CCMP statt TKIP. |
| WPA3 | Wi-Fi Protected Access 3 | Aktueller WLAN-Sicherheitsstandard mit u. a. verbessertem Schutz gegen Offline-Wörterbuchangriffe. |
| XSS | Cross-Site Scripting | Einschleusen von schädlichem JavaScript in eine Webseite, das dann im Browser anderer Nutzer ausgeführt wird. |

Mehrdeutige Kürzel (z. B. CD, CI, AG) haben je nach Fach unterschiedliche Bedeutung. In Prüfungsaufgaben entscheidet der Kontext, welche gemeint ist.

## Einfach

Sicherheit ist wie ein Haus mit Tür, Schloss, Alarmanlage und Versicherung. **CIA** sind die drei Wünsche an das Haus: geheim, unverändert, immer erreichbar. **AES** ist ein sehr gutes Schloss, **RSA** ein Briefkasten, in den jeder etwas einwerfen, aber nur du es herausholen kann. **MFA** heißt, dass du mehrere Beweise brauchst, bevor die Tür aufgeht. **DSGVO** und **BDSG** sind die Hausordnung für die Daten anderer Menschen. **BSI** ist die Behörde, die Tipps gibt, wie man Häuser sicher baut. Viele Kürzel sind Angriffe: **DoS** ist, wenn tausend Leute gleichzeitig klingeln, **XSS** und **SQLi** sind Tricks, bei denen jemand Befehle in Eingabefelder schmuggelt.

So gehst du vor: Schau dir jeden Tag zehn Kürzel an. Sprich die Langform laut aus, überlege dir ein Beispiel aus deinem Alltag oder deinem Betrieb und decke danach die Antwort zu. Wenn du ein Kürzel dreimal richtig hattest, wandert es in den hinteren Teil des Stapels. Kürzel, die du verwechselst, schreibst du nebeneinander auf und notierst den einen Satz, der sie unterscheidet. In der Prüfung hilft dir das doppelt: Du erkennst Aufgabentexte schneller, und wenn die Langform verlangt wird, schreibst du sie sicher und ohne Rechtschreibfehler. Wer die Kürzel kennt, spart in der Klausur wertvolle Minuten für die Rechenaufgaben.

## Merksatz
- CIA: Vertraulichkeit, Integrität, Verfügbarkeit.
- Symmetrisch (AES) = ein Schlüssel, asymmetrisch (RSA) = Schlüsselpaar.
- Hash (SHA-256) für Integrität, Salt gegen Rainbow Tables.
- DSGVO Art. 5: Zweckbindung, Datenminimierung, Richtigkeit, Speicherbegrenzung.

## Prüfungsfalle
- Verschlüsselung (umkehrbar) und Hashing (nicht umkehrbar) verwechseln.
- BSI mit BfDI verwechseln: BSI = IT-Sicherheit, BfDI = Datenschutzaufsicht Bund.
- TOM, AVV und DSFA nicht auseinanderhalten: Maßnahmen, Vertrag mit Dienstleister, Folgenabschätzung.

## Grafik
### So lernst du Abkürzungen
1. Lernender: liest das Kürzel
2. Lernender -> Gedächtnis: spricht die Langform laut aus
3. Gedächtnis: verknüpft sie mit Zweck und Schicht oder Kategorie
4. Lernender -> Karteikarte: prüft sich selbst nach einem Tag
5. Karteikarte -> Lernender: Wiederholung nach einer Woche festigt es

## Karteikarten
- F: Wofür steht AES? | A: Advanced Encryption Standard – Symmetrisches Verschlüsselungsverfahren, aktueller Standard (löst DES/3DES ab); u. a. Basis von WPA2/WPA3 (als CCMP) und BitLocker.
- F: Wofür steht AuthN? | A: Authentication – Authentifizierung Nachweis der Identität („wer bist du?"). Vorstufe zur Autorisierung (AuthZ).
- F: Wofür steht AuthZ? | A: Authorization – Autorisierung Prüfung, welche Rechte eine bereits authentifizierte Identität hat („was darfst du?").
- F: Wofür steht AVV? | A: Auftragsverarbeitungsvertrag – (Art. 28 DSGVO) Verpflichtender Vertrag zwischen Verantwortlichem und Auftragsverarbeiter, wenn personenbezogene Daten im Auftrag verarbeitet werden (z. B. Cloud-Anbieter).
- F: Wofür steht BDSG? | A: Bundesdatenschutzgesetz – Nationales deutsches Datenschutzgesetz; ergänzt/konkretisiert die DSGVO dort, wo diese Öffnungsklauseln vorsieht. Vertiefung: BDSG
- F: Wofür steht BSI? | A: Bundesamt für Sicherheit in der Informationstechnik – Deutsche Cybersicherheitsbehörde; u. a. Herausgeber des IT-Grundschutzkompendiums. Vertiefung: BSI
- F: Wofür steht BSIG? | A: BSI-Gesetz – Gesetz über das Bundesamt für Sicherheit in der Informationstechnik Rechtsgrundlage für Aufgaben und Befugnisse des BSI.
- F: Wofür steht CCMP? | A: Counter Mode CBC-MAC Protocol – Verschlüsselungsprotokoll auf Basis von AES, verwendet in WPA2 (Ersatz für das unsichere TKIP).
- F: Wofür steht CIA? | A: Confidentiality, Integrity, Availability – Vertraulichkeit, Integrität, Verfügbarkeit Die drei klassischen Grundschutzziele der IT-Sicherheit (CIA-Triade).
- F: Wofür steht CSP? | A: Content Security Policy – HTTP-Header, der einschränkt, aus welchen Quellen ein Browser Skripte/Styles/Ressourcen laden darf - Schutz u. a. gegen XSS.
- F: Wofür steht CSRF? | A: Cross-Site Request Forgery – Angriff, bei dem ein Opfer unwissentlich eine Aktion auf einer fremden, authentifizierten Seite ausführt (z. B. über ein manipuliertes Formular).
- F: Wofür steht CVE? | A: Common Vulnerabilities and Exposures – Öffentlicher Katalog eindeutig referenzierbarer, bekannter Sicherheitslücken.
- F: Wofür steht DDoS? | A: Distributed Denial of Service – Überlastungsangriff aus vielen verteilten Quellen gleichzeitig (Botnet) - im Gegensatz zum einfachen DoS (eine Quelle).
- F: Wofür steht DES? | A: Data Encryption Standard – Älterer, heute unsicherer symmetrischer Verschlüsselungsalgorithmus (56-Bit-Schlüssel); durch AES abgelöst.
- F: Wofür steht DMARC? | A: Domain-based Message Authentication, Reporting and Conformance – E-Mail-Standard, der auf Basis von SPF und DKIM festlegt, wie mit nicht-authentifizierten Mails einer Domain zu verfahren ist - Schutz gegen Absender-Spoofing.
- F: Wofür steht DoS? | A: Denial of Service – Überlastungsangriff aus einer einzelnen Quelle. Verteilt: siehe DDoS.
- F: Wofür steht DSB? | A: Datenschutzbeauftragter – Muss von Unternehmen bestellt werden, wenn gesetzliche Kriterien erfüllt sind (Art. 37 DSGVO); überwacht die Einhaltung des Datenschutzes.
- F: Wofür steht DSGVO? | A: Datenschutz-Grundverordnung – General Data Protection Regulation (GDPR) EU-Verordnung zum Schutz personenbezogener Daten; gilt seit 25.05.2018 unmittelbar in allen Mitgliedstaaten. Kernpflichten: Rechtsgrundlage, Zweckbindung, Betroffenenrechte, TOM nach Art. 32. Vertiefung: DSGVO
- F: Wofür steht ECC? | A: Elliptic Curve Cryptography – Asymmetrisches Kryptografieverfahren auf Basis elliptischer Kurven - vergleichbare Sicherheit zu RSA bei deutlich kürzeren Schlüsseln.
- F: Wofür steht eIDAS? | A: electronic IDentification, Authentication and trust Services – EU-Verordnung für elektronische Identifizierung und Vertrauensdienste (u. a. rechtliche Grundlage der qualifizierten elektronischen Signatur, QES).
- F: Wofür steht EU? | A: Europäische Union
- F: Wofür steht EWR? | A: Europäischer Wirtschaftsraum – Erweitert den EU-Binnenmarkt um Island, Liechtenstein und Norwegen; relevant für die Frage, ob ein Datentransfer als „Drittlandtransfer" nach DSGVO gilt.
- F: Wofür steht FDE? | A: Full Disk Encryption – Vollständige Verschlüsselung eines Datenträgers (z. B. via TPM/BitLocker), schützt Daten bei physischem Diebstahl.
- F: Wofür steht GG? | A: Grundgesetz – Deutsche Verfassung; u. a. Grundlage für Grundrechte, die auch im Arbeits-/Datenschutzrecht wirken.
- F: Wofür steht IAM? | A: Identity and Access Management – Prozesse und Systeme zur Verwaltung digitaler Identitäten und ihrer Zugriffsrechte.
- F: Wofür steht ICS? | A: Industrial Control System – Steuerungssysteme für industrielle Prozesse/Anlagen (z. B. SCADA); typisches Ziel gezielter Cyberangriffe auf KRITIS.
- F: Wofür steht IEC? | A: International Electrotechnical Commission – Internationale Normungsorganisation für Elektrotechnik/Elektronik; zusammen mit der ISO Herausgeberin u. a. der ISO/IEC-27000-Reihe.
- F: Wofür steht IPsec? | A: Internet Protocol Security – Protokollsammlung zur Verschlüsselung/Authentifizierung von IP-Verkehr - häufige Grundlage von Site-to-Site-VPNs.
- F: Wofür steht ISB? | A: Informationssicherheitsbeauftragter – Verantwortet die Umsetzung und Steuerung der Informationssicherheit im Unternehmen (zentrale Rolle im ISMS).
- F: Wofür steht ISMS? | A: Informationssicherheits-Managementsystem – Systematischer, dokumentierter Ansatz zur Steuerung der Informationssicherheit einer Organisation (Planung, Umsetzung, Kontrolle, Verbesserung); nach ISO 27001 zertifizierbar. Vertiefung: ISMS
- F: Wofür steht ISO 27001? | A: ISO/IEC 27001 – International anerkannte, zertifizierbare Norm für Informationssicherheits-Managementsysteme (ISMS); folgt dem Plan-Do-Check-Act-Zyklus. Vertiefung: ISO 27001
- F: Wofür steht IT-SiG? | A: IT-Sicherheitsgesetz – Deutsches Gesetz zur Erhöhung der Sicherheit informationstechnischer Systeme, insbesondere für KRITIS-Betreiber; verpflichtet zu Mindeststandards und Meldepflichten bei Sicherheitsvorfällen. IT-SiG 2.0 (2021) weitete den KRITIS-Sektor aus und stärkte die Rolle des BSI (u. a. als NCCA). Vertiefung: IT-SiG
- F: Wofür steht JWT? | A: JSON Web Token – Kompaktes, signiertes Token-Format zum sicheren Austausch von Claims, häufig zur zustandslosen Authentifizierung bei APIs.
- F: Wofür steht KRITIS? | A: Kritische Infrastrukturen – Einrichtungen (Energie, Gesundheit, Wasser, IT/TK, …), deren Ausfall erhebliche Auswirkungen auf das Gemeinwesen hätte - unterliegen verschärften Sicherheitsanforderungen nach IT-SiG.
- F: Wofür steht KVP? | A: Kontinuierlicher Verbesserungsprozess – Fortlaufende, iterative Verbesserung von Prozessen (z. B. zentrales Prinzip eines ISMS nach ISO 27001, siehe auch PDCA).
- F: Wofür steht MFA? | A: Multi-Faktor-Authentifizierung – Authentifizierung über mindestens zwei unabhängige Faktoren (Wissen, Besitz, Inhärenz) - deutlich sicherer als reine Passwort-Anmeldung.
- F: Wofür steht MITM? | A: Man-in-the-Middle – Angriff, bei dem sich der Angreifer unbemerkt zwischen zwei Kommunikationspartner schaltet und Daten mitliest/manipuliert.
- F: Wofür steht NCCA? | A: Nationale Behörde für Cybersicherheitszertifizierung – (National Cybersecurity Certification Authority) Rolle des BSI im Rahmen der EU-Cybersicherheitszertifizierung.
- F: Wofür steht PGP? | A: Pretty Good Privacy – Verschlüsselungs-/Signaturprogramm, klassisches Beispiel hybrider Verschlüsselung (asymmetrisch + symmetrisch) für E-Mails.
- F: Wofür steht PII? | A: Personally Identifiable Information – personenbezogene Daten Englischer Fachbegriff, entspricht dem DSGVO-Begriff „personenbezogene Daten".
- F: Wofür steht PIN? | A: Persönliche Identifikationsnummer
- F: Wofür steht PSK? | A: Pre-Shared Key – Vorab zwischen den Parteien vereinbarter, gemeinsamer geheimer Schlüssel (z. B. bei WPA2-Personal).
- F: Wofür steht QES? | A: Qualifizierte elektronische Signatur – Höchste Vertrauensstufe der elektronischen Signatur nach eIDAS; hat Schriftformwirkung (§ 126a BGB).
- F: Wofür steht RBAC? | A: Role-Based Access Control – Berechtigungen werden Rollen zugewiesen, Benutzer erhalten Rollen - nicht Einzelrechte. Wirkt auf der Ebene Zugriff (nicht Zugang).
- F: Wofür steht RSA? | A: Rivest-Shamir-Adleman – Weit verbreitetes asymmetrisches Verschlüsselungsverfahren, benannt nach seinen Erfindern.
- F: Wofür steht SAML? | A: Security Assertion Markup Language – XML-basierter Standard für Single Sign-On (SSO) zwischen Identitätsanbieter und Diensten.
- F: Wofür steht SHA? | A: Secure Hash Algorithm – Familie kryptografischer Hashfunktionen (z. B. SHA-256) zur Erzeugung von Prüfsummen/digitalen Signaturen.
- F: Wofür steht SPF? | A: Sender Policy Framework – E-Mail-Standard: legt fest, welche Server im Namen einer Domain Mails versenden dürfen - Schutz gegen Absender-Spoofing.
- F: Wofür steht SSL? | A: Secure Sockets Layer – Älteres Verschlüsselungsprotokoll, Vorläufer von TLS (gilt heute als unsicher/veraltet, Begriff wird oft noch synonym für TLS verwendet).
- F: Wofür steht SSO? | A: Single Sign-On – Einmalige Anmeldung, die Zugriff auf mehrere unabhängige Systeme/Anwendungen gewährt.
- F: Wofür steht StGB? | A: Strafgesetzbuch – Regelt in Deutschland, welches Verhalten strafbar ist (relevant u. a. bei Datenausspähung, Computerbetrug).
- F: Wofür steht TAN? | A: Transaktionsnummer – Einmalpasswort zur Freigabe einzelner Transaktionen (klassisch im Online-Banking).
- F: Wofür steht TKG? | A: Telekommunikationsgesetz – Reguliert den Telekommunikationssektor in Deutschland; u. a. relevant für Datenschutz bei TK-Diensten.
- F: Wofür steht TKIP? | A: Temporal Key Integrity Protocol – Älteres, heute unsicheres WLAN-Verschlüsselungsprotokoll (WPA), durch CCMP/AES (WPA2) abgelöst.
- F: Wofür steht TLS? | A: Transport Layer Security – Verschlüsselungsprotokoll für sichere Verbindungen (Nachfolger von SSL); Grundlage von HTTPS.
- F: Wofür steht TMG? | A: Telemediengesetz – Regelte u. a. Impressumspflicht und Datenschutz bei Telemedien in Deutschland (inzwischen weitgehend im Digitale-Dienste-Gesetz/TTDSG aufgegangen, im IT-SiG-Kontext noch als Referenz relevant).
- F: Wofür steht TOM? | A: Technisch-organisatorische Maßnahmen – Technical and Organizational Measures Nach Art. 32 DSGVO verpflichtende Schutzmaßnahmen: technisch (Verschlüsselung, RBAC, Backup, Firewall) und organisatorisch (Richtlinien, Schulungen, Rollenkonzept). Vertiefung: Notiz TOM noch ohne Inhalt → siehe Notizen ohne Inhalt
- F: Wofür steht TPM? | A: Trusted Platform Module – Hardware-Sicherheitschip, der kryptografische Schlüssel sicher speichert - Grundlage u. a. für Festplattenverschlüsselung (FDE/BitLocker) und Boot-Integrität.
- F: Wofür steht VCIA? | A: Merkwort – für die vier IT-Schutzziele: Vertraulichkeit, Confidentiality/Integrität, Integrity, Availability/Verfügbarkeit - deutsch-englische Merkhilfe, ergänzt um Authentizität. Deutsche Variante: VIVA.
- F: Wofür steht WAF? | A: Web Application Firewall – Spezialisierte Firewall, die HTTP(S)-Verkehr auf Anwendungsebene filtert (Schutz u. a. gegen SQL-Injection, XSS).
- F: Wofür steht WEP? | A: Wired Equivalent Privacy – Ältestes, heute als unsicher geltendes WLAN-Verschlüsselungsverfahren.
- F: Wofür steht WPA? | A: Wi-Fi Protected Access – WLAN-Sicherheitsstandard, Nachfolger von WEP; nutzt TKIP (inzwischen ebenfalls veraltet).
- F: Wofür steht WPA2? | A: Wi-Fi Protected Access 2 – Deutlich sichererer WLAN-Standard, nutzt AES/CCMP statt TKIP.
- F: Wofür steht WPA3? | A: Wi-Fi Protected Access 3 – Aktueller WLAN-Sicherheitsstandard mit u. a. verbessertem Schutz gegen Offline-Wörterbuchangriffe.
- F: Wofür steht XSS? | A: Cross-Site Scripting – Einschleusen von schädlichem JavaScript in eine Webseite, das dann im Browser anderer Nutzer ausgeführt wird.

## Quiz

? Wofür steht IEC?
* International Electrotechnical Commission
- JSON Web Token
- Cross-Site Request Forgery
- Personally Identifiable Information

? Wofür steht WPA3?
* Wi-Fi Protected Access 3
- Cross-Site Scripting
- Role-Based Access Control
- Trusted Platform Module

? Wofür steht RBAC?
* Role-Based Access Control
- Man-in-the-Middle
- Content Security Policy
- Denial of Service

? Wofür steht KVP?
* Kontinuierlicher Verbesserungsprozess
- Transport Layer Security
- Europäischer Wirtschaftsraum
- Rivest-Shamir-Adleman

? Wofür steht IPsec?
* Internet Protocol Security
- electronic IDentification, Authentication and trust Services
- Wi-Fi Protected Access 3
- Transport Layer Security

? Wofür steht SSO?
* Single Sign-On
- Bundesamt für Sicherheit in der Informationstechnik
- Content Security Policy
- Persönliche Identifikationsnummer

? Wofür steht EU?
* Europäische Union
- Rivest-Shamir-Adleman
- Security Assertion Markup Language
- Cross-Site Scripting

? Wofür steht ISMS?
* Informationssicherheits-Managementsystem
- Web Application Firewall
- Confidentiality, Integrity, Availability
- Common Vulnerabilities and Exposures

? Wofür steht NCCA?
* Nationale Behörde für Cybersicherheitszertifizierung
- Kontinuierlicher Verbesserungsprozess
- Wi-Fi Protected Access
- Confidentiality, Integrity, Availability

? Wofür steht TPM?
* Trusted Platform Module
- Counter Mode CBC-MAC Protocol
- Personally Identifiable Information
- Merkwort

? Wofür steht GG?
* Grundgesetz
- Nationale Behörde für Cybersicherheitszertifizierung
- Strafgesetzbuch
- Security Assertion Markup Language

? Wofür steht eIDAS?
* electronic IDentification, Authentication and trust Services
- Authorization
- Wired Equivalent Privacy
- Secure Hash Algorithm

? Wofür steht DoS?
* Denial of Service
- Full Disk Encryption
- Domain-based Message Authentication, Reporting and Conformance
- Cross-Site Scripting

? Wofür steht StGB?
* Strafgesetzbuch
- Counter Mode CBC-MAC Protocol
- Internet Protocol Security
- Man-in-the-Middle

? Wofür steht CVE?
* Common Vulnerabilities and Exposures
- Datenschutz-Grundverordnung
- JSON Web Token
- Transaktionsnummer

? Wofür steht RSA?
* Rivest-Shamir-Adleman
- Transaktionsnummer
- Cross-Site Scripting
- Cross-Site Request Forgery
