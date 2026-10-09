---
id: ap2-kryptografie
bereich: AP2
block: A11
kapitel: Kryptografie
titel: Kryptografie, Hash, Signatur, Zertifikate und PKI
stufe: Fortgeschritten
quellen: [BSI TR-02102, IHK-Prüfungskatalog]
verweise: [ap2-it-sicherheit, ap2-datenschutz, ap2-netzwerk-design, ap1-a6-lds-rms]
---

## Profi

### Symmetrisch vs. asymmetrisch
| | **Symmetrisch** | **Asymmetrisch** |
|---|---|---|
| **Schlüssel** | **Ein gemeinsamer** | **Schlüsselpaar: öffentlich + privat** |
| **Tempo** | **Schnell** | **Langsam** |
| **Problem** | **Schlüsselaustausch**, **n·(n−1)/2 Schlüssel** | **Echtheit des öffentlichen Schlüssels** (→ Zertifikate) |
| **Verfahren** | **AES** (128/256), ChaCha20; veraltet: DES, 3DES, RC4 | **RSA** (≥ 3000 Bit empfohlen), **ECC** (ECDSA, ECDH), **Diffie-Hellman** |

**Hybrid** (TLS, S/MIME, PGP): **asymmetrisch** den **Sitzungsschlüssel austauschen**, **symmetrisch** die **Daten verschlüsseln**.

### Wer nutzt welchen Schlüssel?
| Ziel | Absender | Empfänger |
|---|---|---|
| **Verschlüsseln** (Vertraulichkeit) | **Öffentlicher Schlüssel des Empfängers** | **Eigener privater Schlüssel** |
| **Signieren** (Integrität, Authentizität) | **Eigener privater Schlüssel** (signiert Hash) | **Öffentlicher Schlüssel des Absenders** |

### Hashfunktionen
**Einweg**, **feste Länge**, **kleine Änderung → ganz anderer Hash** (**Lawineneffekt**), **kollisionsresistent**. **Aktuell**: **SHA-256/384/512, SHA-3**. **Unsicher**: **MD5, SHA-1**. **Einsatz**: **Integrität, Passwortspeicherung** (**mit Salt**, langsame Verfahren: **bcrypt, scrypt, Argon2, PBKDF2**), **Signatur**.
**HMAC** = Hash + geheimer Schlüssel → **Integrität + Authentizität**.

### Digitale Signatur – Ablauf
1. Absender **hasht** die Nachricht.
2. **Hash** wird mit **privatem Schlüssel** verschlüsselt = **Signatur**.
3. Empfänger **entschlüsselt Signatur** mit **öffentlichem Schlüssel** und **hasht selbst**.
4. **Gleich** → **unverändert und echt**.
**Signatur ≠ Verschlüsselung** – Inhalt bleibt **lesbar**.

### Zertifikate (X.509) und PKI
**Zertifikat** = **öffentlicher Schlüssel + Identität**, **signiert von einer CA**. Inhalt: **Seriennummer, Aussteller, Inhaber (Subject), SAN** (Alternativnamen), **Gültigkeit**, **öffentlicher Schlüssel**, **Verwendungszweck**, **Signatur der CA**, **CRL/OCSP-Adresse**.

| PKI-Baustein | Aufgabe |
|---|---|
| **Root-CA** | **Vertrauensanker**, **oft offline** |
| **Sub-/Intermediate-CA** | **Stellt Zertifikate aus** |
| **RA** (Registration Authority) | **Prüft Identität** |
| **CRL** | **Sperrliste** |
| **OCSP** | **Online-Statusabfrage** |
| **Vertrauenskette** | **Server-Zertifikat → Intermediate → Root** |

**Validierungsstufen**: **DV** (Domain), **OV** (Organisation), **EV** (erweitert). **Let’s Encrypt**: DV, kostenlos, **90 Tage**, **ACME**-Automatisierung.
**Windows**: **AD CS** (Enterprise-CA, Vorlagen, Autoenrollment per GPO).
**Dateiformate**: **.cer/.crt** (öffentlich), **.pfx/.p12** (**mit privatem Schlüssel**), **.pem**, **.csr** (Antrag).

### Einsatzfelder
**TLS 1.2/1.3** (HTTPS 443), **S/MIME, PGP** (E-Mail), **SSH** (Schlüsselpaar), **IPsec/VPN**, **Code-Signing**, **BitLocker** (AES), **WPA3** (SAE), **802.1X/EAP-TLS**.

### TLS-Handshake (vereinfacht, 1.3)
Client Hello (Cipher, Key Share) → Server Hello + **Zertifikat** → Client **prüft Kette** → **Schlüsselaustausch (ECDHE)** → **symmetrische Sitzung (AES-GCM)**. **Perfect Forward Secrecy** durch **ephemere** Schlüssel.

## Einfach
**Symmetrisch** = **ein Schlüssel für Tür auf und zu**, du musst ihn **dem Freund geben** (gefährlich). **Asymmetrisch** = **ein Briefkasten**: **Jeder kann einwerfen** (**öffentlicher Schlüssel**), **nur du hast den Schlüssel zum Öffnen** (**privater**). **Signatur** = **dein Siegel mit deinem Ring** – jeder kann prüfen, dass es echt ist. **Zertifikat** = **Personalausweis**, der **vom Amt (CA)** gestempelt ist.

## Merksatz
- **Verschlüsseln mit fremdem öffentlichen**, **signieren mit eigenem privaten**.
- **Hybrid = asymmetrisch Schlüssel, symmetrisch Daten**.
- **MD5/SHA-1 tot**, **SHA-256 ok**.
- **Passwort-Hash mit Salt und langsam**.
- **PFX = mit privatem Schlüssel**.
- **Kette: Server → Intermediate → Root**.

## Prüfungsfalle
- **Signieren mit öffentlichem Schlüssel** – falsch.
- **Hash ist keine Verschlüsselung** (nicht umkehrbar).
- **Signatur macht Inhalt nicht geheim**.
- **Anzahl symmetrischer Schlüssel** für n Teilnehmer: **n(n−1)/2** (z. B. 10 → 45).
- **Abgelaufenes/gesperrtes Zertifikat** → Warnung trotz Verschlüsselung.
- **Private Key** darf **nie** den Besitzer verlassen (**PFX schützen**).

## Grafik
### Briefkasten
Offener Einwurfschlitz (öffentlich), nur ein Schlüssel zum Öffnen (privat).

### Siegelring
Hash wird mit Ring versiegelt; jeder prüft mit Abdruck.

### Vertrauenskette
Drei gestapelte Zertifikate, Root ganz oben mit Krone.

## Karteikarten
- F: Womit verschlüsselt man eine Nachricht an Bob? | A: Mit Bobs öffentlichem Schlüssel.
- F: Womit signiert Alice? | A: Mit ihrem privaten Schlüssel.
- F: Vorteil symmetrischer Verfahren? | A: Schnell.
- F: Problem symmetrischer Verfahren? | A: Sicherer Schlüsselaustausch.
- F: Was ist hybride Verschlüsselung? | A: Asymmetrisch Sitzungsschlüssel tauschen, symmetrisch Daten verschlüsseln.
- F: Eigenschaften einer Hashfunktion? | A: Einweg, feste Länge, Lawineneffekt, kollisionsresistent.
- F: Was ist ein Salt? | A: Zufallswert, der vor dem Hashen an das Passwort gehängt wird.
- F: Was enthält eine PFX-Datei? | A: Zertifikat mit privatem Schlüssel.
- F: Was prüft OCSP? | A: Online den Sperrstatus eines Zertifikats.
- F: Wie viele Schlüssel bei 10 Teilnehmern symmetrisch? | A: 45.

## Quiz
? Welcher Schlüssel wird zum Signieren verwendet?
* Privater Schlüssel des Absenders
- Öffentlicher Schlüssel des Empfängers
- Öffentlicher Schlüssel des Absenders
- Gemeinsamer symmetrischer Schlüssel

? Welches Hashverfahren gilt als sicher?
* SHA-256
- MD5
- SHA-1
- CRC32

? Was bietet eine digitale Signatur nicht?
* Vertraulichkeit
- Integrität
- Authentizität
- Nichtabstreitbarkeit

? Welches Verfahren ist symmetrisch?
* AES
- RSA
- ECDSA
- Diffie-Hellman

? Welche Datei enthält den privaten Schlüssel?
* .pfx
- .cer
- .csr
- .crl
