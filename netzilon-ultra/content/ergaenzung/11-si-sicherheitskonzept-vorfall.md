---
id: erg-sicherheitskonzept-vorfall
bereich: AP2
block: ERG
kapitel: Ergänzungen 2.2
titel: IT-Sicherheitskonzept und Sicherheitsvorfall – Schutzbedarf, Maßnahmen, Verschlüsselung und Incident Response
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [BSI-Standard 200-2 (IT-Grundschutz-Methodik), BSI IT-Grundschutz-Kompendium DER.2.1 (Behandlung von Sicherheitsvorfällen), DSGVO Art. 32–34, NIST SP 800-61]
verweise: [ap2-it-sicherheit, ap2-kryptografie, ap2-angriffe-schutz, ap2-datenschutz, ihk-lz-sicherheit, ihk-infosicherheit-recht, az801-bitlocker, wiso-datenschutz-dsgvo]
---

## Profi

### Schutzziele und Schutzbedarf
Die klassischen **Schutzziele** sind **Vertraulichkeit** (nur Befugte lesen), **Integrität** (Daten unverändert und korrekt) und **Verfügbarkeit** (Systeme nutzbar, wenn benötigt) – **CIA**. Ergänzend: **Authentizität**, **Verbindlichkeit/Nichtabstreitbarkeit**, **Zurechenbarkeit**.

Nach **BSI-Standard 200-2** läuft die **Standard-Absicherung** so ab: **Strukturanalyse** (Geschäftsprozesse, Anwendungen, IT-Systeme, Räume, Netze erfassen) → **Schutzbedarfsfeststellung** je Schutzziel in den Kategorien **normal / hoch / sehr hoch** (Schadensszenarien: Verstoß gegen Gesetze, Beeinträchtigung der Aufgabenerfüllung, finanzielle Auswirkungen, Ansehen …) → **Modellierung** mit Bausteinen des IT-Grundschutz-Kompendiums → **IT-Grundschutz-Check** (Soll-Ist-Vergleich) → **Risikoanalyse** für hohen/sehr hohen Schutzbedarf → **Umsetzung** und **Aufrechterhaltung** (PDCA). Beim Vererben gilt das **Maximumprinzip**: Ein Server hat den höchsten Schutzbedarf der Anwendungen, die auf ihm laufen.

### Maßnahmenarten
| Art | Beispiele |
|---|---|
| technisch | Firewall, Verschlüsselung, MFA, Patchmanagement, Virenschutz/EDR, Backup, Segmentierung |
| organisatorisch | Rollen- und Berechtigungskonzept, Richtlinien, Schulungen, Notfallhandbuch, Vier-Augen-Prinzip |
| infrastrukturell/physisch | Zutrittskontrolle, Serverraum, USV, Brandschutz, Klimatisierung |
| personell | Sensibilisierung, Verpflichtung auf Vertraulichkeit, geregeltes Ausscheiden |

### Verschlüsselung im Überblick
- **Symmetrisch** (AES): ein gemeinsamer Schlüssel, sehr schnell; Problem ist der **Schlüsselaustausch**.
- **Asymmetrisch** (RSA, ECC): Schlüsselpaar – mit dem **öffentlichen Schlüssel des Empfängers verschlüsseln**, nur sein **privater** entschlüsselt. Langsam.
- **Hybrid** (TLS, S/MIME, PGP): Asymmetrisch (bzw. per Diffie-Hellman) wird ein **Sitzungsschlüssel** vereinbart, die Daten werden **symmetrisch** verschlüsselt.
- **Hash** (SHA-256): Einwegfunktion für **Integrität**; **digitale Signatur** = Hash mit dem **privaten Schlüssel des Absenders** signiert, Prüfung mit seinem öffentlichen Schlüssel → Integrität + Authentizität.
- **Zertifikat** (X.509) bindet einen öffentlichen Schlüssel an eine Identität, ausgestellt von einer **Zertifizierungsstelle (CA)**.

### Behandlung von Sicherheitsvorfällen (Incident Response)
1. **Vorbereitung** – Meldewege, Notfallkontakte, Werkzeuge, Backups, Übungen.
2. **Erkennung und Analyse** – Meldung (Benutzer, SIEM, EDR), Einstufung, Beweissicherung (Logs, Speicherabbild, keine voreiligen Neuinstallationen).
3. **Eindämmung** – betroffene Systeme **vom Netz isolieren** (Netzwerkkabel ziehen / Port sperren, **nicht** einfach ausschalten, wenn forensische Daten im RAM gebraucht werden), Konten sperren, Kennwörter ändern.
4. **Beseitigung** – Schadsoftware entfernen, Schwachstelle schließen.
5. **Wiederherstellung** – aus sauberem Backup, Überwachung verstärken.
6. **Nachbereitung** – Lessons Learned, Dokumentation, Maßnahmen anpassen.
**Meldepflichten**: Verletzung des Schutzes personenbezogener Daten → Meldung an die **Aufsichtsbehörde binnen 72 Stunden** (Art. 33 DSGVO), bei hohem Risiko Benachrichtigung der Betroffenen (Art. 34). Betreiber kritischer Infrastrukturen bzw. nach NIS2 regulierte Einrichtungen haben zusätzliche Meldepflichten an das BSI.

## Einfach
Stell dir vor, deine Firma ist eine **Burg**. Darin gibt es Schätze: Kundendaten, Rechnungen, Baupläne. Ein **Sicherheitskonzept** ist der Plan, wie man die Burg schützt.

Zuerst schaut man: **Was ist wie wertvoll?** Die Speisekarte der Kantine darf jeder sehen – normaler Schutz. Die Gehaltsliste ist geheim – hoher Schutz. Das nennt man **Schutzbedarf**. Drei Fragen sind immer wichtig:
- Darf das **nur der Richtige sehen**? (Vertraulichkeit)
- Ist es **richtig und unverändert**? (Integrität)
- Ist es **da, wenn ich es brauche**? (Verfügbarkeit)

Dann baut man **Schutzmaßnahmen**: hohe Mauern (Firewall), Schlösser an den Türen (Kennwörter, Zwei-Faktor-Anmeldung), Wachen, die Bescheid wissen (geschulte Mitarbeiter), und einen Ersatzschatz im Keller (Backup).

**Verschlüsselung** ist eine Geheimschrift. Entweder haben beide denselben Schlüssel (schnell, aber wie gibst du ihn sicher weiter?), oder jeder hat ein **offenes Vorhängeschloss** zum Verteilen und einen **geheimen Schlüssel**, den nur er hat. Im Internet kombiniert man beides.

Und wenn trotzdem ein Angreifer reinkommt? Dann gibt es einen **Notfallplan**: Alarm schlagen, den befallenen Raum abschließen (Computer vom Netz trennen), Spuren sichern, den Eindringling vertreiben, alles aus dem sauberen Ersatzschatz wiederherstellen und hinterher überlegen, wie man es besser macht. Wenn Kundendaten gestohlen wurden, muss man das innerhalb von **drei Tagen** der Datenschutzbehörde melden.

## Merksatz
- **CIA: Vertraulichkeit, Integrität, Verfügbarkeit.**
- **Schutzbedarf: normal – hoch – sehr hoch; Maximumprinzip.**
- **Verschlüsseln mit dem öffentlichen Schlüssel des Empfängers, signieren mit dem eigenen privaten.**
- **Hybrid = asymmetrisch für den Schlüssel, symmetrisch für die Daten.**
- **Vorfall: isolieren statt ausschalten – Datenpanne in 72 h melden.**

## Prüfungsfalle
- Verschlüsselung schützt die **Vertraulichkeit**, ein Hash allein die **Integrität** – nicht umgekehrt.
- Bei der Signatur wird mit dem **privaten Schlüssel des Absenders** gearbeitet, nicht mit dem öffentlichen des Empfängers.
- Ein befallenes System **sofort neu aufsetzen** vernichtet Beweise – zuerst isolieren und sichern.
- Die 72-Stunden-Frist der DSGVO beginnt mit **Kenntnis** der Verletzung, nicht mit deren Ende.
- Backup ohne getestete Wiederherstellung und ohne Offline-Kopie schützt nicht vor Ransomware.

## Grafik
### Hybride Verschlüsselung (vereinfachtes TLS)
1. Client -> Server: Verbindungsaufbau, unterstützte Verfahren
2. Server -> Client: Zertifikat mit öffentlichem Schlüssel
3. Client: Prüft Zertifikat gegen vertrauenswürdige CA
4. Client -> Server: Schlüsselaustausch (Diffie-Hellman) – gemeinsamer Sitzungsschlüssel
5. Client -> Server: Daten symmetrisch mit AES verschlüsselt

### Ablauf eines Sicherheitsvorfalls
1. Benutzer -> Service Desk: Meldung „Dateien heißen plötzlich .locked“
2. Service Desk -> Security-Team: Eskalation als Sicherheitsvorfall
3. Security-Team -> Client: Netzwerkport sperren, Gerät isolieren
4. Security-Team: Beweise sichern, Ausmaß analysieren
5. Security-Team -> Datenschutzbeauftragter: Prüfung der Meldepflicht (72 h)
6. Admin -> Server: Wiederherstellung aus sauberem Backup
7. Security-Team: Lessons Learned und Maßnahmen

## Lab
**Maschinen**: Windows-11-Client **CL01** und Server **SRV01** (Windows Server 2025) im Heimlabor **example.com**.

### GUI
1. **CL01**: Windows-Sicherheit → Viren- & Bedrohungsschutz → Schnellüberprüfung und Schutzverlauf ansehen.
2. **CL01**: Systemsteuerung → BitLocker-Laufwerkverschlüsselung → Status des Systemlaufwerks prüfen; Wiederherstellungsschlüssel ist im AD bzw. Entra ID gesichert.
3. **SRV01**: Ereignisanzeige → Windows-Protokolle → Sicherheit → nach Ereignis-ID 4625 (fehlgeschlagene Anmeldung) filtern.
4. **CL01**: Simulierte Isolation: Netzwerkadapter in den Netzwerkverbindungen deaktivieren (nur im Labor).

### PowerShell
```powershell
# CL01
Get-MpComputerStatus | Select-Object AMServiceEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated
Get-BitLockerVolume | Select-Object MountPoint, VolumeStatus, ProtectionStatus
Get-FileHash C:\Windows\System32\notepad.exe -Algorithm SHA256
Disable-NetAdapter -Name 'Ethernet' -Confirm:$false     # Isolation (Labor)

# SRV01
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 20
```

## Legende
### Schutzbedarfsfeststellung
- Was: Bewertung, wie schwer ein Schaden bei Verletzung von Vertraulichkeit, Integrität und Verfügbarkeit wäre.
- Wie: Schadensszenarien je Objekt in normal/hoch/sehr hoch einstufen und auf Systeme vererben (Maximumprinzip).
- Wann: Nach der Strukturanalyse, vor der Auswahl der Maßnahmen.
- Wo: Im Sicherheitskonzept nach BSI-Standard 200-2.
- Warum: Maßnahmen werden angemessen statt überall maximal oder minimal gewählt.

### Incident Response
- Was: Geregeltes Vorgehen bei Sicherheitsvorfällen.
- Wie: Vorbereitung, Erkennung/Analyse, Eindämmung, Beseitigung, Wiederherstellung, Nachbereitung.
- Wann: Bei Verdacht auf Angriff, Schadsoftware, Datenabfluss oder Missbrauch.
- Wo: Service Desk, Security-Team/CERT, Geschäftsleitung, Datenschutzbeauftragter.
- Warum: Schaden begrenzen, Beweise sichern, Meldepflichten einhalten.

## Karteikarten
- F: Nennen Sie die drei klassischen Schutzziele. | A: Vertraulichkeit, Integrität, Verfügbarkeit (CIA).
- F: Welche Schutzbedarfskategorien kennt der IT-Grundschutz? | A: Normal, hoch, sehr hoch.
- F: Was besagt das Maximumprinzip? | A: Ein System erbt den höchsten Schutzbedarf der Anwendungen bzw. Daten, die es verarbeitet.
- F: Nennen Sie je ein Beispiel für technische, organisatorische und infrastrukturelle Maßnahmen. | A: Technisch: Firewall/MFA; organisatorisch: Berechtigungskonzept/Schulung; infrastrukturell: Zutrittskontrolle/USV.
- F: Wie funktioniert hybride Verschlüsselung? | A: Ein symmetrischer Sitzungsschlüssel wird asymmetrisch bzw. per Diffie-Hellman ausgetauscht; die Nutzdaten werden symmetrisch verschlüsselt.
- F: Mit welchem Schlüssel wird eine digitale Signatur erstellt? | A: Mit dem privaten Schlüssel des Absenders; geprüft mit dessen öffentlichem Schlüssel.
- F: Was stellt ein Hashwert sicher? | A: Integrität – jede Änderung der Daten ergibt einen anderen Hash.
- F: Nennen Sie die Phasen der Incident Response. | A: Vorbereitung, Erkennung/Analyse, Eindämmung, Beseitigung, Wiederherstellung, Nachbereitung.
- F: Innerhalb welcher Frist ist eine Datenschutzverletzung der Aufsichtsbehörde zu melden? | A: Binnen 72 Stunden nach Bekanntwerden (Art. 33 DSGVO), sofern ein Risiko für Betroffene besteht.
- F: Warum sollte ein befallener PC nicht sofort neu installiert werden? | A: Beweise (Logs, RAM, Schadcode) gingen verloren; Ursache und Ausmaß blieben unklar.

## Quiz
? Welches Schutzziel wird durch eine USV vorrangig unterstützt?
* Verfügbarkeit
- Vertraulichkeit
- Integrität
- Authentizität
! Die USV hält Systeme bei Stromausfall in Betrieb.

? Mit welchem Schlüssel verschlüsselt Anna eine E-Mail an Ben (asymmetrisch)?
* Mit Bens öffentlichem Schlüssel
- Mit Annas privatem Schlüssel
- Mit Bens privatem Schlüssel
- Mit Annas öffentlichem Schlüssel
! Nur Bens privater Schlüssel kann die Nachricht entschlüsseln.

? Was ist die erste Maßnahme bei einem mit Ransomware befallenen Client?
* Den Client vom Netzwerk isolieren
- Den Client sofort formatieren
- Das Lösegeld zahlen
- Alle Server herunterfahren
! Isolation verhindert die Ausbreitung; Beweise bleiben erhalten.

? Welche Frist nennt die DSGVO für die Meldung einer Datenschutzverletzung an die Aufsichtsbehörde?
* 72 Stunden
- 24 Stunden
- 7 Tage
- 30 Tage
! Art. 33 DSGVO – binnen 72 Stunden nach Bekanntwerden.

? Was beschreibt das Maximumprinzip im IT-Grundschutz?
* Ein System übernimmt den höchsten Schutzbedarf der darauf laufenden Anwendungen.
- Es wird immer der maximale Schutz umgesetzt.
- Der Schutzbedarf wird gemittelt.
- Die teuerste Maßnahme wird gewählt.
! Daneben gibt es Kumulations- und Verteilungseffekt.

? Warum wird bei TLS hybrid verschlüsselt?
* Asymmetrische Verfahren sind langsam, symmetrische haben ein Schlüsselaustauschproblem.
- Weil symmetrische Verfahren unsicher sind.
- Weil asymmetrische Verfahren keine Schlüssel brauchen.
- Weil Hashfunktionen sonst nicht funktionieren.
! Kombination aus sicherem Schlüsselaustausch und schneller Datenverschlüsselung.

? Welche Maßnahme ist organisatorisch?
* Schulung der Mitarbeiter zu Phishing
- Einbau einer Firewall
- Verschlüsselung der Festplatte
- Installation einer USV
! Firewall und Verschlüsselung sind technisch, USV infrastrukturell.

? Welches Schutzziel wird durch eine digitale Signatur zusätzlich zur Integrität gesichert?
* Authentizität
- Verfügbarkeit
- Vertraulichkeit
- Skalierbarkeit
! Die Signatur belegt, wer die Nachricht erstellt hat.

? Welcher BSI-Standard beschreibt die IT-Grundschutz-Methodik?
* BSI-Standard 200-2
- BSI-Standard 100-1
- ISO 9001
- DIN 4102
! 200-1 ISMS, 200-2 Methodik, 200-3 Risikoanalyse, 200-4 Notfallmanagement.

## Lücken
- Die drei Schutzziele sind Vertraulichkeit, {Integrität} und {Verfügbarkeit}.
- Eine digitale Signatur erstellt der Absender mit seinem {privaten} Schlüssel.
- Datenschutzverletzungen sind binnen {72} Stunden zu melden.
- Ein System erbt nach dem {Maximumprinzip} den höchsten Schutzbedarf.
- Bei hybrider Verschlüsselung werden die Nutzdaten {symmetrisch} verschlüsselt.

## Zuordnen
### Maßnahme und Schutzziel
- Verschlüsselung => Vertraulichkeit
- Hashwert/Prüfsumme => Integrität
- Redundanz und USV => Verfügbarkeit
- Digitale Signatur => Authentizität

### Maßnahme und Maßnahmenart
- Firewall => technisch
- Berechtigungskonzept => organisatorisch
- Zutrittskontrolle zum Serverraum => infrastrukturell
- Sensibilisierungsschulung => personell

### Verfahren und Kategorie
- AES => symmetrische Verschlüsselung
- RSA => asymmetrische Verschlüsselung
- SHA-256 => Hashfunktion
- TLS => hybrides Verfahren

## Reihenfolge
### Sicherheitskonzept nach IT-Grundschutz (Standard-Absicherung)
1. Strukturanalyse
2. Schutzbedarfsfeststellung
3. Modellierung mit Bausteinen
4. IT-Grundschutz-Check
5. Risikoanalyse für hohen Schutzbedarf
6. Umsetzung und Aufrechterhaltung

### Incident Response
1. Vorbereitung
2. Erkennung und Analyse
3. Eindämmung
4. Beseitigung
5. Wiederherstellung
6. Nachbereitung (Lessons Learned)

### Digitale Signatur prüfen
1. Empfänger berechnet den Hash der Nachricht
2. Signatur mit dem öffentlichen Schlüssel des Absenders entschlüsseln
3. Beide Hashwerte vergleichen
4. Zertifikat des Absenders gegen die CA prüfen
5. Bei Übereinstimmung: Nachricht unverändert und authentisch

## Freitext
- F: Erläutern Sie den Unterschied zwischen symmetrischer und asymmetrischer Verschlüsselung und nennen Sie je einen Vor- und Nachteil. | M: Symmetrisch: ein gemeinsamer Schlüssel; schnell, aber sicherer Schlüsselaustausch schwierig. Asymmetrisch: Schlüsselpaar öffentlich/privat; kein Austausch geheimer Schlüssel nötig, aber rechenintensiv/langsam. | P: 6
- F: Beschreiben Sie vier Sofortmaßnahmen bei einem Ransomware-Befall auf einem Client. | M: Gerät vom Netz isolieren (nicht neu installieren), Vorfall melden/eskalieren, betroffene Konten sperren/Kennwörter ändern, Beweise sichern, Ausbreitung prüfen (Netzlaufwerke, Server), Backups schützen, Meldepflichten prüfen. | P: 4
- F: Erklären Sie das Maximumprinzip an einem Beispiel. | M: Auf einem Server laufen das Intranet (Schutzbedarf normal) und die Lohnbuchhaltung (Vertraulichkeit sehr hoch) – der Server erhält für Vertraulichkeit den Schutzbedarf sehr hoch. | P: 3

## Szenario
### Verschlüsselte Dateien auf dem Fileserver
Montagmorgen melden mehrere Benutzer, dass Dateien auf `\\FS01\Projekte` nicht mehr zu öffnen sind und die Endung .locked haben. Auf CL12 erscheint eine Lösegeldforderung.
- F: Welche Maßnahmen ergreifen Sie in den ersten Minuten? | A: CL12 isolieren, Freigabe/FS01 vom Netz bzw. Schreibzugriff sperren, Vorfall eskalieren, Konto des Benutzers sperren, Beweise sichern. | P: 4
- F: Wie stellen Sie die Daten wieder her? | A: Ausmaß bestimmen, Schadsoftware entfernen/Systeme neu aufsetzen, Daten aus sauberem (offline/unveränderlichem) Backup bzw. Schattenkopien zurückspielen, danach verstärkt überwachen. | P: 3
- F: Muss der Vorfall gemeldet werden? | A: Falls personenbezogene Daten betroffen sind und ein Risiko besteht: Meldung an die Aufsichtsbehörde binnen 72 h; Datenschutzbeauftragten einbinden. | P: 2

### Schutzbedarf eines Webshops
Ein Händler betreibt einen Webshop mit Kundenkonten und Zahlungsabwicklung über einen Dienstleister. Ein Ausfall von mehr als 4 Stunden führt zu erheblichen Umsatzverlusten.
- F: Bewerten Sie den Schutzbedarf für Vertraulichkeit und Verfügbarkeit. | A: Vertraulichkeit hoch (personenbezogene Kundendaten), Verfügbarkeit hoch (Umsatzverluste, Ansehen). | P: 2
- F: Nennen Sie je zwei passende Maßnahmen. | A: Vertraulichkeit: TLS, Verschlüsselung der Datenbank, MFA für Admins. Verfügbarkeit: redundante Server/Load Balancer, Backup mit Wiederherstellungstest, DDoS-Schutz. | P: 4

### Vertrauliche Angebote per E-Mail
Der Vertrieb soll Angebote verschlüsselt und nachweisbar unverändert an Kunden senden.
- F: Welches Verfahren schlagen Sie vor? | A: S/MIME (oder PGP) mit Zertifikaten: signieren mit dem eigenen privaten Schlüssel, verschlüsseln mit dem öffentlichen Schlüssel des Kunden (hybrid). | P: 3
- F: Was benötigt der Kunde dafür? | A: Ein eigenes Zertifikat/Schlüsselpaar zum Entschlüsseln und das Zertifikat bzw. die CA-Kette des Absenders zur Signaturprüfung. | P: 2
