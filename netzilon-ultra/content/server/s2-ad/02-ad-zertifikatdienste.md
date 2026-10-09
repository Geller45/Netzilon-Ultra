---
id: server-adcs
bereich: AP2
pruefungen: [Schule, AP2]
fach: Windows Server / Adv.
block: S2
kapitel: Active Directory
titel: AD-Zertifikatdienste (AD CS) – PKI, CA-Typen, Vorlagen, Sperrlisten und Übung CA installieren
stufe: Profi
quellen: [AD-Zertifikatdienste.pdf, Übung-Zertifizierungsstellen_installieren.pdf]
verweise: [ap2-kryptografie, pf-adcs-1, pf-adcs-2, ap1-a6-gpo-grundlagen, ap1-a6-efs-vss, az800-webanwendungsproxy]
---

## Profi

### Ziele sicherer Kommunikation
- **Vertraulichkeit** – Daten sollen nicht von anderen gelesen werden (Verschlüsselung).
- **Integrität** – Daten werden auf dem Weg nicht verfälscht (Hash, Signatur).
- **Authentizität** – die Identität ist gesichert, die Nachricht stammt wirklich vom Absender (Zertifikat, Signatur).

### Symmetrisch, asymmetrisch, hybrid
| | symmetrisch | asymmetrisch |
|---|---|---|
| Schlüssel | **ein** gemeinsamer Schlüssel | **Schlüsselpaar**: öffentlicher (Public) + privater (Private) Key |
| Vorteil | sehr schnell/effizient | kein geheimer Schlüsselaustausch nötig |
| Nachteil | Schlüssel muss sicher verteilt werden; je mehr Personen, desto größer das Risiko | sehr langsam (Faktor ≥ 1000) |
| Algorithmen (Folie) | DES (56 Bit), 3DES (168 Bit), **AES (128/192/256 Bit)**, RC4 | **RSA** (Verschlüsselung + Signatur), **DSA** (nur Signatur), **Diffie-Hellman** (Schlüsselvereinbarung, IPsec), heute auch **ECC/ECDSA/ECDH** |
**Lösung: Kombination (hybrid)** – ein zufälliger **Sitzungsschlüssel** (symmetrisch, z. B. AES) verschlüsselt die Daten; dieser Sitzungsschlüssel wird mit dem **öffentlichen Schlüssel des Empfängers** (asymmetrisch) verschlüsselt mitgeschickt. So arbeiten TLS, S/MIME und EFS.

Ablauf asymmetrische Verschlüsselung: 1. Absender besorgt den **öffentlichen Schlüssel des Empfängers** → 2. verschlüsselt den Klartext damit → 3. sendet → 4. Empfänger entschlüsselt mit seinem **privaten Schlüssel**.

### Digitale Signatur
1. Ersteller erzeugt die Nachricht im Klartext.
2. Software berechnet einen **Hashwert** (*Message Digest*).
3. Der Hash wird mit dem **privaten Schlüssel des Absenders** verschlüsselt = Signatur.
4. Klartext + Signatur gehen an den Empfänger.
5. Empfänger entschlüsselt die Signatur mit dem **öffentlichen Schlüssel des Absenders** (aus dessen Zertifikat).
6. Empfänger berechnet selbst den Hash der Nachricht.
7. Beide Hashes vergleichen – weichen sie ab, wurde die Nachricht verändert.
Die Signatur sichert **Integrität und Authentizität**, aber **keine Vertraulichkeit** (der Text ist lesbar).

### PKI-Begriffe
- **Digitales Zertifikat** (X.509 v3): digital signierte Daten, die einen **öffentlichen Schlüssel an eine Identität binden**. Inhalt: Version, **Seriennummer**, Antragsteller (UPN, E-Mail, Hostname/SAN), **öffentlicher Schlüssel**, **Aussteller** (CA), Signatur-/Hashalgorithmus, **Gültigkeitszeitraum**, **Verwendungszweck** (EKU, z. B. Serverauthentifizierung, EFS, Smartcard-Anmeldung), Sperrlisten-Verteilungspunkt (CDP), AIA.
- **Zertifizierungsstelle (CA)**: prüft die Identität der Antragsteller (in AD automatisch, sonst z. B. per Ausweis), **stellt Zertifikate aus und signiert** sie, **verwaltet Sperrungen**, veröffentlicht Richtlinien (Sicherung der CA, Identitätsprüfung).
- **Sperrliste (CRL)**: Liste der Zertifikate, die **vor Ablauf** zurückgezogen wurden (z. B. kompromittierter Schlüssel). **Basissperrliste** = alle gesperrten Zertifikate; **Deltasperrliste** = nur die seit der letzten Basis-CRL gesperrten. Alternative: **Online-Responder (OCSP)** für Einzelabfragen.

### AD CS installieren – Entscheidungen
- Berechtigung: **Domänen-Admin** bzw. **Organisations-Admin** (Enterprise-CA schreibt in die Konfigurationspartition).
- Nach der Installation **kann der Rechner nicht mehr umbenannt** oder aus der Domäne genommen werden.
- **CA-Typ**:
| Typ | AD-integriert | Vorlagen/Autoenrollment | typisch |
|---|---|---|---|
| **Stamm-CA des Unternehmens** (Enterprise Root) | ja | ja | kleine Umgebung, Labor |
| **Untergeordnete CA des Unternehmens** (Enterprise Subordinate) | ja | ja | ausstellende CA unter einer Root |
| **Eigenständige Stamm-CA** (Standalone Root) | nein | nein | **Offline-Root** in zweistufiger PKI |
| **Eigenständige untergeordnete CA** | nein | nein | Zertifikate für Nicht-Domänen-Geräte/Internet |
- **Schlüsselpaar** (neu oder vorhanden), **Kryptografiedienstanbieter (KSP)** und **Hashalgorithmus** (heute **SHA-256** oder höher, RSA **≥ 2048**, für CAs gern **4096**).
- **Name und Gültigkeitsdauer** (Root z. B. 10–20 Jahre, ausstellende CA kürzer als Root).
- **Pfade** für Datenbank und Protokolle (Standard C:\Windows\system32\CertLog).
- Untergeordnete CA: Zertifikat bei der **übergeordneten CA anfordern** (online) oder als **Anforderungsdatei (.req)** speichern.

### Rollendienste
**Zertifizierungsstelle**, **Zertifizierungsstellen-Webregistrierung** (/certsrv), **Online-Responder** (OCSP), **Registrierungsdienst für Netzwerkgeräte** (NDES/SCEP), **Zertifikatregistrierungs-Webdienst** (CES) und **Zertifikatregistrierungsrichtlinien-Webdienst** (CEP).

### Zertifikatvorlagen
Nur in **Unternehmens-CAs**. Sie definieren **Format und Inhalt** (Zweck, Schlüssellänge, Gültigkeit), den **Antragsprozess** und **wer** lesen/registrieren/automatisch registrieren darf (DACL). Verwaltung mit `certtmpl.msc`; eine Vorlage muss danach an der CA unter **Zertifikatvorlagen → Neu → Auszustellende Zertifikatvorlage** veröffentlicht werden.
| Berechtigung | erlaubt |
|---|---|
| **Vollzugriff** | alle Attribute inkl. Berechtigungen ändern |
| **Lesen** | Vorlage bei der Registrierung im AD finden |
| **Schreiben** | alle Attribute außer Berechtigungen ändern |
| **Registrieren** | Zertifikat auf Basis der Vorlage anfordern |
| **Automatisch registrieren** | Zertifikat per **Autoenrollment** erhalten (benötigt zusätzlich **Lesen + Registrieren**) |

### Automatische Registrierung (Autoenrollment)
Clients per **GPO**: *Computerkonfiguration\Richtlinien\Windows-Einstellungen\Sicherheitseinstellungen\Richtlinien für öffentliche Schlüssel* → **Zertifikatdienstclient – Automatische Registrierung** → **Aktiviert** mit den Haken **„Abgelaufene Zertifikate erneuern, ausstehende aktualisieren und gesperrte entfernen“** und **„Zertifikate, die Zertifikatvorlagen verwenden, aktualisieren“**. Auch unter Benutzerkonfiguration möglich. Server-Seite (Standard): Eigenschaften der CA → **Richtlinienmodul** → **„Den Einstellungen der Zertifikatvorlage folgen, falls zutreffend. Zertifikat ansonsten automatisch ausstellen“**.

## Einfach

Stell dir vor, du willst einem Freund einen **geheimen Brief** schicken.
- **Symmetrisch** ist wie eine **Truhe mit einem Schlüssel**, von dem es zwei gleiche gibt. Schnell auf- und zuzumachen – aber wie bringst du den zweiten Schlüssel sicher zu deinem Freund? Wenn ihn unterwegs jemand kopiert, kann er alles lesen.
- **Asymmetrisch** ist wie ein **Briefkasten mit Schlitz**: Jeder kann einen Brief **einwerfen** (öffentlicher Schlüssel), aber nur der Besitzer hat den **Schlüssel zum Öffnen** (privater Schlüssel). Super sicher, aber langsam.
- **Hybrid**: Du legst den **kleinen Truhenschlüssel** in den Briefkasten deines Freundes – jetzt hat nur er ihn, und ihr könnt danach schnell mit der Truhe arbeiten.

Eine **digitale Signatur** ist wie ein **Siegel aus Wachs mit deinem Ring**: Jeder sieht, dass der Brief von dir ist und dass niemand ihn geöffnet und verändert hat.

Aber woher weiß dein Freund, dass der Briefkasten wirklich **deiner** ist? Dafür gibt es den **Ausweis** – das **Zertifikat**. Ausgestellt wird er vom **Bürgeramt** – der **Zertifizierungsstelle (CA)**. Das Bürgeramt prüft, wer du bist, und stempelt den Ausweis. Wird ein Ausweis **gestohlen**, kommt er auf die **Liste gesperrter Ausweise** (CRL).

Im Firmennetz ist der Windows-Server mit **AD CS** das Bürgeramt. Die **Root-CA** ist das **Ministerium** ganz oben, die **untergeordneten CAs** sind die **Ämter** vor Ort. **Vorlagen** sind die **Formulare** („Antrag auf Personalausweis“, „Antrag auf Führerschein“). Und **Autoenrollment** bedeutet: Jeder Mitarbeiter bekommt seinen Ausweis **automatisch** zugeschickt – niemand muss Schlange stehen.

## Merksatz
- **V-I-A**: Vertraulichkeit, Integrität, Authentizität.
- **Verschlüsseln mit dem öffentlichen Schlüssel des Empfängers – signieren mit dem eigenen privaten.**
- **Hybrid = AES für Daten, RSA für den Schlüssel.**
- **Vorlagen und Autoenrollment nur bei Unternehmens-CA.**
- **Basis-CRL = alle, Delta-CRL = nur neue.**
- Autoenrollment braucht **Lesen + Registrieren + Automatisch registrieren**.

## Prüfungsfalle
- **Quellen veraltet:** DES, 3DES, RC4, MD5 und **SHA-1 gelten heute als unsicher** (die Folie nennt SHA-1 noch „sicherer“). Stand 2026: AES, SHA-256/384, RSA ≥ 2048 (BSI TR-02102 empfiehlt ≥ 3000 Bit für lange Nutzung), ECC.
- Folie zur Signatur Schritt 5: Der **öffentliche Schlüssel** des Absenders wird über das **Zertifikat** verteilt – „mit den signierten Daten verschickt“ ist nur dann sicher, wenn das Zertifikat von einer vertrauenswürdigen CA stammt.
- Eine **eigenständige** CA kennt **keine Vorlagen** und kein Autoenrollment; Anforderungen müssen dort meist manuell **ausgestellt** werden.
- CA auf einem **Domänencontroller** (wie in der Übung) ist nur fürs Labor ok – in der Praxis eigener Server, Root-CA **offline**.
- CDP auf einer Freigabe mit „Jeder – Schreiben“ ist unsicher; produktiv **HTTP-CDP** (für Clients) und Schreibrecht nur für das Computerkonto der CA.
- Quellenfehler: Die Variable heißt **CRLNameSuffix** (nicht „CLRNameSuffix“).

## Grafik
### Zweistufige Zertifikatausstellung mit Autoenrollment
1. EXA-CL01: GPO aktiviert Autoenrollment
2. EXA-CL01 -> EXA-DC01: Vorlagen und Berechtigungen aus AD lesen
3. EXA-CL01 -> EXA-SRV01: Zertifikatanforderung mit öffentlichem Schlüssel
4. EXA-SRV01: prüft Identität über AD und Vorlagenrecht Registrieren
5. EXA-SRV01 -> EXA-CL01: signiertes Zertifikat
6. EXA-CL01: prüft Kette bis zur Root-CA example-EXA-DC01-CA
### Digitale Signatur prüfen
1. Absender: Hash der Nachricht bilden
2. Absender: Hash mit privatem Schlüssel verschlüsseln
3. Absender -> Empfänger: Nachricht + Signatur + Zertifikat
4. Empfänger: Signatur mit öffentlichem Schlüssel entschlüsseln
5. Empfänger: eigenen Hash bilden und vergleichen

## Lab
Heimlabor **example.com**: **EXA-DC01** (DC, später Unternehmens-Stamm-CA), **EXA-SRV01** (untergeordnete Unternehmens-CA), **EXA-SRV02** (eigenständige untergeordnete CA). Anmeldung jeweils als EXAMPLE\Administrator. Kennwörter werden nicht dokumentiert.

### GUI
**Schritt 1 – Unternehmens-Stamm-CA auf EXA-DC01**
1. Server-Manager → Rollen hinzufügen → **Active Directory-Zertifikatdienste** → Rollendienste: **alle außer Online-Responder**.
2. Nach der Installation → **AD-Zertifikatdienste auf dem Zielserver konfigurieren** → zuerst **Zertifizierungsstelle** und **Zertifizierungsstellen-Webregistrierung** auswählen.
3. Setup-Typ **Unternehmenszertifizierungsstelle** → CA-Typ **Stammzertifizierungsstelle** → **Neuen privaten Schlüssel erstellen** → Schlüssellänge **4096** (Hash SHA256) → CA-Name unverändert (**example-EXA-DC01-CA**) → Gültigkeit **10 Jahre** → Konfigurieren.
4. Meldung „Weitere Rollendienste konfigurieren?“ → **Ja** → **Zertifikatregistrierungs-Webdienst (CES)** und **Zertifikatregistrierungsrichtlinien-Webdienst (CEP)** auswählen.
5. CES: eigene CA auswählen → Authentifizierung **Windows integriert** → Dienstkonto **Integrierte Anwendungspoolidentität**; CEP: Authentifizierung **Integrierte Windows-Authentifizierung**; Serverzertifikat **EXA-DC01.example.com** (von example-EXA-DC01-CA) → Konfigurieren.

**Schritt 2 – Untergeordnete Unternehmens-CA auf EXA-SRV01**
6. Rolle AD CS → nur **Zertifizierungsstelle** → Konfiguration: **Unternehmens-CA**, **Untergeordnete Zertifizierungsstelle** → neuer Schlüssel (Standard) → **Zertifikatanforderung an übergeordnete CA senden** → Auswählen → example-EXA-DC01-CA → Konfigurieren.

**Schritt 3 – Eigenständige untergeordnete CA auf EXA-SRV02**
7. EXA-SRV02 der Domäne beitreten → Rolle AD CS, nur Zertifizierungsstelle → **Eigenständige CA**, **Untergeordnete CA**, neuer Schlüssel, **4096** → Seite Zertifikatanforderung: Speichern als Datei, z. B. **C:\EXA-SRV02.example.com_example-EXA-SRV02-CA.req**.
8. Erklärung: Eine eigenständige CA arbeitet nicht mit AD und kann ihr CA-Zertifikat nicht automatisch abrufen – die Anforderung wird **manuell** bei der Root eingereicht.

**Schritt 4 – Eigenständige CA fertigstellen (EXA-SRV02)**
9. Server-Manager → Lokaler Server → **Verstärkte Sicherheitskonfiguration für IE** → Aus (bzw. Edge verwenden).
10. Browser → **http://EXA-DC01/certsrv** → **Ein Zertifikat anfordern** → **Erweiterte Zertifikatanforderung** → „Base64-codierte CMC- oder PKCS#10-Datei einreichen“.
11. Die .req-Datei mit Notepad öffnen → gesamten Inhalt kopieren → in **Gespeicherte Anforderung** einfügen → Vorlage **Untergeordnete Zertifizierungsstelle** → **Einsenden** → **Zertifikat herunterladen** (Base64) → speichern.
12. EXA-SRV02 → Konsole **Zertifizierungsstelle (lokal)** → Rechtsklick CA → **Alle Aufgaben → Zertifizierungsstellenzertifikat installieren** → Dateityp **X.509 (*.cer)** → Datei wählen → anschließend CA-Dienst **starten** (grünes Play-Symbol).

**Schritt 6 – Zusätzlicher Sperrlisten-Veröffentlichungspunkt**
13. **EXA-SRV01**: Ordner **C:\ALT-CDP** anlegen und freigeben (Übung: Jeder Lesen/Schreiben; besser: Computerkonto EXA-DC01$ Ändern).
14. **EXA-DC01**: Zertifizierungsstelle → Eigenschaften der CA → **Erweiterungen** → Erweiterung **Sperrlisten-Verteilungspunkt (CDP)** → **Hinzufügen** → Ort `file://\\EXA-SRV01\ALT-CDP\` → Variablen **<CaName>**, **<CRLNameSuffix>**, **<DeltaCRLAllowed>** einfügen → am Ende **.crl** anhängen → OK.
15. Für den neuen Ort alle wählbaren Kontrollkästchen aktivieren (u. a. **Sperrlisten an diesem Ort veröffentlichen**, **Delta-Sperrlisten an diesem Ort veröffentlichen**) → OK → Dienst **neu starten** lassen.
16. **Gesperrte Zertifikate** → Rechtsklick → **Alle Aufgaben → Veröffentlichen** → **Neue Sperrliste**.
17. **EXA-SRV01**: im Ordner ALT-CDP müssen **zwei Dateien** liegen: example-EXA-DC01-CA.crl (Basis) und example-EXA-DC01-CA+.crl (Delta).

### PowerShell
```powershell
# EXA-DC01: Rollen und Unternehmens-Stamm-CA
Install-WindowsFeature ADCS-Cert-Authority, ADCS-Web-Enrollment, ADCS-Enroll-Web-Pol, ADCS-Enroll-Web-Svc -IncludeManagementTools
Install-AdcsCertificationAuthority -CAType EnterpriseRootCA -CryptoProviderName "RSA#Microsoft Software Key Storage Provider" `
  -KeyLength 4096 -HashAlgorithmName SHA256 -ValidityPeriod Years -ValidityPeriodUnits 10
Install-AdcsWebEnrollment
Install-AdcsEnrollmentPolicyWebService -AuthenticationType Kerberos
# Zertifikat-Fingerabdruck des IIS-Serverzertifikats ermitteln und CES einrichten
$thumb = (Get-ChildItem Cert:\LocalMachine\My | Where-Object Subject -like '*EXA-DC01*').Thumbprint
Install-AdcsEnrollmentWebService -CAConfig "EXA-DC01.example.com\example-EXA-DC01-CA" -AuthenticationType Kerberos `
  -ApplicationPoolIdentity -SSLCertThumbprint $thumb

# EXA-SRV01: untergeordnete Unternehmens-CA
Install-WindowsFeature ADCS-Cert-Authority -IncludeManagementTools
Install-AdcsCertificationAuthority -CAType EnterpriseSubordinateCA -ParentCA "EXA-DC01.example.com\example-EXA-DC01-CA"

# EXA-SRV02: eigenstaendige untergeordnete CA mit Anforderungsdatei
Install-WindowsFeature ADCS-Cert-Authority -IncludeManagementTools
Install-AdcsCertificationAuthority -CAType StandaloneSubordinateCA -KeyLength 4096 -OutputCertRequestFile C:\EXA-SRV02.req

# EXA-DC01: Anforderung mit Vorlage SubCA einreichen und abholen
certreq -submit -attrib "CertificateTemplate:SubCA" -config "EXA-DC01\example-EXA-DC01-CA" C:\EXA-SRV02.req C:\EXA-SRV02.cer

# EXA-SRV02: CA-Zertifikat installieren und Dienst starten
certutil -installcert C:\EXA-SRV02.cer
Start-Service certsvc

# EXA-DC01: zusaetzlicher CDP auf EXA-SRV01 und CRL veroeffentlichen
Add-CACrlDistributionPoint -Uri 'file://\\EXA-SRV01\ALT-CDP\<CaName><CRLNameSuffix><DeltaCRLAllowed>.crl' -PublishToServer -PublishDeltaToServer -Force
Restart-Service certsvc
certutil -crl
Get-CACrlDistributionPoint | Format-Table Uri, PublishToServer, AddToCertificateCdp
```

## Befehle
- `Install-WindowsFeature ADCS-Cert-Authority -IncludeManagementTools` – Rolle Zertifizierungsstelle
- `Install-AdcsCertificationAuthority -CAType EnterpriseRootCA` – Unternehmens-Stamm-CA konfigurieren
- `Install-AdcsCertificationAuthority -CAType StandaloneSubordinateCA -OutputCertRequestFile` – eigenständige Sub-CA mit .req
- `Install-AdcsWebEnrollment` – Webregistrierung /certsrv
- `certreq -submit -attrib "CertificateTemplate:SubCA"` – Anforderung bei der CA einreichen
- `certutil -installcert datei.cer` – CA-Zertifikat auf Sub-CA installieren
- `certutil -crl` – neue Sperrliste veröffentlichen
- `Add-CACrlDistributionPoint` – zusätzlichen CDP anlegen
- `certutil -verify -urlfetch datei.cer` – Kette und Sperrstatus prüfen
- `certtmpl.msc` / `certsrv.msc` / `certlm.msc` – Vorlagen, CA-Konsole, Computerzertifikate
- `gpupdate /force` und `certutil -pulse` – Autoenrollment sofort anstoßen

## Übungen
- A: Warum kann die eigenständige Sub-CA auf EXA-SRV02 ihr Zertifikat nicht automatisch erhalten? | L: Eigenständige CAs sind nicht in AD integriert; die Anforderung wird als Datei gespeichert und muss manuell bei der Unternehmens-Root (Webregistrierung oder certreq) mit der Vorlage „Untergeordnete Zertifizierungsstelle“ eingereicht werden.
- A: Welche Rollendienste werden in Schritt 1 im zweiten Durchgang konfiguriert? | L: Zertifikatregistrierungs-Webdienst (CES) und Zertifikatregistrierungsrichtlinien-Webdienst (CEP).
- A: Welche Dateien entstehen nach „Neue Sperrliste veröffentlichen“ im Ordner ALT-CDP? | L: Die Basissperrliste <CaName>.crl und die Deltasperrliste <CaName>+.crl.
- A: Wofür stehen <CaName>, <CRLNameSuffix>, <DeltaCRLAllowed>? | L: Name der CA; Suffix bei erneuertem CA-Schlüssel (z. B. (1)); ein „+“ für Delta-CRLs, damit Basis und Delta unterschiedliche Dateinamen haben.
- A: Was prüft eine CA vor der Ausstellung? | L: Die Identität des Antragstellers (bei Unternehmens-CA über AD-Konto und Vorlagenberechtigung, sonst manuell z. B. per Ausweis).
- A: Nennen Sie sechs Inhalte eines Zertifikats. | L: Version (X.509 v3), Seriennummer, Antragsteller (UPN/E-Mail/Hostname), öffentlicher Schlüssel, Aussteller, Signaturalgorithmus, Gültigkeitszeitraum, Verwendungszweck.
- A: Welche Berechtigungen braucht eine Gruppe für Autoenrollment auf einer Vorlage? | L: Lesen, Registrieren und Automatisch registrieren.
- A: Unterschied Basis- und Deltasperrliste? | L: Basis-CRL enthält alle gesperrten Zertifikate, Delta-CRL nur die seit der letzten Basis-CRL gesperrten – kleiner, häufiger veröffentlichbar.

## Karteikarten
- F: Drei Ziele sicherer Kommunikation? | A: Vertraulichkeit, Integrität, Authentizität
- F: Womit verschlüsselt man eine Nachricht an Bob asymmetrisch? | A: Mit Bobs öffentlichem Schlüssel
- F: Womit erstellt man eine digitale Signatur? | A: Hash der Nachricht, verschlüsselt mit dem eigenen privaten Schlüssel
- F: Warum hybride Verschlüsselung? | A: Asymmetrisch ist langsam, symmetrisch braucht sicheren Schlüsselaustausch – Kombination nutzt beide Vorteile
- F: Welcher Algorithmus eignet sich nur zur Signatur? | A: DSA
- F: Wofür nutzt man Diffie-Hellman? | A: Vereinbarung eines gemeinsamen geheimen Schlüssels (z. B. IPsec)
- F: Was ist eine CRL? | A: Certificate Revocation List – vor Ablauf gesperrte Zertifikate
- F: Vier CA-Typen in AD CS? | A: Unternehmens-Stamm, Unternehmens-untergeordnet, eigenständige Stamm, eigenständige untergeordnete CA
- F: Was kann man nach der AD-CS-Installation nicht mehr tun? | A: Den Rechner umbenennen (oder die Domänenmitgliedschaft ändern)
- F: Wo gibt es Zertifikatvorlagen? | A: Nur bei Unternehmens-CAs
- F: GPO-Pfad für Autoenrollment? | A: Computerkonfiguration\Richtlinien\Windows-Einstellungen\Sicherheitseinstellungen\Richtlinien für öffentliche Schlüssel → Zertifikatdienstclient – Automatische Registrierung
- F: Wozu dient ein Online-Responder? | A: OCSP – Sperrstatus eines einzelnen Zertifikats online abfragen statt ganze CRL laden
- F: Warum Root-CA offline? | A: Schutz des wichtigsten privaten Schlüssels; Kompromittierung würde die gesamte PKI entwerten

## Quiz
? Mit welchem Schlüssel wird eine Nachricht an Bob verschlüsselt?
* Bobs öffentlichem Schlüssel
- Bobs privatem Schlüssel
- Dem eigenen privaten Schlüssel
- Dem eigenen öffentlichen Schlüssel

? Welche Eigenschaft sichert eine digitale Signatur NICHT?
* Vertraulichkeit
- Integrität
- Authentizität
- Nichtabstreitbarkeit

? Welcher CA-Typ unterstützt Zertifikatvorlagen und Autoenrollment?
* Unternehmenszertifizierungsstelle
- Eigenständige Stammzertifizierungsstelle
- Eigenständige untergeordnete Zertifizierungsstelle
- Online-Responder

? Was enthält eine Deltasperrliste?
* Nur die seit der letzten Basissperrliste gesperrten Zertifikate
- Alle jemals ausgestellten Zertifikate
- Alle gesperrten Zertifikate seit Installation
- Nur abgelaufene Zertifikate

? Welche Berechtigung braucht eine Gruppe zusätzlich zu Lesen und Registrieren für Autoenrollment?
* Automatisch registrieren
- Vollzugriff
- Schreiben
- Besitz übernehmen

? Welcher Algorithmus gilt heute als sicher für symmetrische Verschlüsselung?
* AES-256
- DES
- RC4
- 3DES mit 56 Bit

? Wie wird die eigenständige untergeordnete CA in der Übung zertifiziert?
* Anforderungsdatei manuell über die Webregistrierung der Root einreichen
- Automatisch über Active Directory
- Durch Umbenennen des Servers
- Über eine Gruppenrichtlinie

? Welche Folge hat die Installation von AD CS auf einem Server?
* Der Server kann nicht mehr umbenannt werden
- Der Server wird automatisch DC
- Kerberos wird deaktiviert
- Der Server darf keine Freigaben mehr haben

? Was ist bei den Hashfunktionen der Folie heute zu beachten?
* MD5 und SHA-1 gelten als gebrochen – SHA-256 oder höher verwenden
- SHA-1 ist sicherer als SHA-256
- MD5 hat 512 Bit
- Hashes sind umkehrbar

## Lücken
- Ziele sicherer Kommunikation sind {Vertraulichkeit}, {Integrität} und {Authentizität}.
- Signiert wird mit dem {privaten} Schlüssel des Absenders, geprüft mit dessen {öffentlichem} Schlüssel.
- Die {Basissperrliste} enthält alle gesperrten Zertifikate, die {Deltasperrliste} nur die neuen.

## Zuordnen
### CA-Typ und Einsatz
- Unternehmens-Stamm-CA => kleine AD-Umgebung, Labor
- Unternehmens-untergeordnete CA => ausstellende CA mit Vorlagen
- Eigenständige Stamm-CA => Offline-Root
- Eigenständige untergeordnete CA => Zertifikate ohne AD-Integration

## Reihenfolge
### Digitale Signatur erstellen und prüfen
1. Hash der Nachricht berechnen
2. Hash mit dem privaten Schlüssel des Absenders verschlüsseln
3. Nachricht und Signatur senden
4. Signatur mit dem öffentlichen Schlüssel des Absenders entschlüsseln
5. Eigenen Hash berechnen
6. Hashwerte vergleichen

## Freitext
- F: Erläutern Sie das hybride Verschlüsselungsverfahren. | M: Daten werden mit einem zufälligen symmetrischen Sitzungsschlüssel (z. B. AES) verschlüsselt; dieser Schlüssel wird mit dem öffentlichen Schlüssel des Empfängers (RSA) verschlüsselt und mitgesendet; der Empfänger entschlüsselt ihn mit seinem privaten Schlüssel. Vorteil: Geschwindigkeit + sicherer Schlüsseltausch | P: 5
- F: Begründen Sie eine zweistufige PKI mit Offline-Root. | M: Der Root-Schlüssel ist das Fundament des Vertrauens; offline ist er vor Angriffen geschützt; Ausstellung übernehmen untergeordnete CAs, die bei Kompromittierung gesperrt und ersetzt werden können | P: 4

## Spickzettel
- V-I-A; symmetrisch schnell, asymmetrisch sicherer Tausch → hybrid
- Verschlüsseln: Public des Empfängers; Signieren: eigener Private
- CA-Typen: Enterprise Root/Sub (AD, Vorlagen), Standalone Root/Sub (offline/ohne AD)
- Vorlagenrechte: Lesen, Registrieren, Automatisch registrieren
- CRL Basis + Delta, OCSP = Online-Responder
- Autoenrollment per GPO „Zertifikatdienstclient – Automatische Registrierung“
- Rechner mit AD CS nicht umbenennen; Root offline; SHA-256, RSA ≥ 2048/4096
