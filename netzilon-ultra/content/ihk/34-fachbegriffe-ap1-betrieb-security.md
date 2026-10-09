---
id: ihk-fachbegriffe-betrieb-security
bereich: AP1
block: IHK
kapitel: Fachbegriffe AP1
titel: AP1-Fachbegriffe Teil 2 – Wirtschaft, IT-Sicherheit, Projekt, Hardware, Support, Industrie 4.0
stufe: Einsteiger
fach: PV – AP1
pruefungen: [AP1]
quellen: [baf15487-Fachbegriffe.pdf]
verweise: [ihk-fachbegriffe-technik, ihk-lz-sicherheit, ihk-netzplan, ihk-nutzwertanalyse, wiso-datenschutz-dsgvo, ihk-lz-server-storage]
---

## Profi

### Beschaffung und Wirtschaft
**Miete** (flexible Laufzeit, Vermieter trägt Wartung), **Leasing** (feste Laufzeit, Leasingnehmer trägt Wartung, am Ende Rückgabe oder Kauf zum Restwert), **Kauf** (Eigentum, volle Verantwortung, Wiederverkaufswert). Kaufvertrag = zwei übereinstimmende Willenserklärungen (Angebot und Annahme). Vertragsstörungen: Lieferverzug, Zahlungsverzug, Annahmeverzug, mangelhafte Lieferung.
**Quantitativer Angebotsvergleich (Bezugspreis):**
Listeneinkaufspreis - Rabatt = Zieleinkaufspreis; - Skonto = Bareinkaufspreis; + Bezugskosten = **Bezugspreis**.
**Qualitativ:** Nutzwertanalyse mit gewichteten Kriterien (Mindestbestellmenge, Zahlungs- und Lieferbedingungen, Qualität, Nachhaltigkeit, Zuverlässigkeit, Service).
Vertrieb: direkt (eigener Shop, volle Marge, Kundennähe) gegenüber indirekt (Händler, schnellere Skalierung, mehr Reichweite, geringere Fixkosten). IT-Kosten: einmalig (Anschaffung, Installation) und laufend (Strom, Support, Lizenzen). Urheberrecht schützt Quellcode, Dokumentation, Datenbanken und Design. Systeme: **CRM** (Kundenbeziehungen), **ERP** (Einkauf, Produktion, Lager, Buchhaltung), **DMS** (Dokumente), **CMS** (Webinhalte).

### Informationssicherheit und Datenschutz
Informationssicherheit schützt Informationen in jeder Form und umfasst **Datensicherheit** (technische und organisatorische Maßnahmen, TOM) und **Datenschutz** (Schutz personenbezogener Daten natürlicher Personen; DSGVO und BDSG). Betroffenenrechte: Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch. Grundsätze (Art. 5 DSGVO): Rechtmäßigkeit/Treu und Glauben/Transparenz, Zweckbindung, Datenminimierung, Richtigkeit, Speicherbegrenzung, Integrität und Vertraulichkeit. **Schutzziele:** Vertraulichkeit, Integrität, Verfügbarkeit, außerdem Authentizität und Verbindlichkeit. **Hash** = digitaler Fingerabdruck fester Länge (SHA-256, SHA-3; MD5 unsicher). **Zwei-Faktor:** zwei verschiedene Kategorien aus Wissen, Besitz, Inhärenz. **Anonymisierung** (nicht rückführbar) gegenüber **Pseudonymisierung** (rückführbar mit Zusatzinformation). **Privacy by Design** (Datenschutz von Anfang an) und **Privacy by Default** (datenschutzfreundliche Voreinstellung).

**Malware:** Virus (hängt sich an Dateien), Wurm (verbreitet sich selbst im Netz), Trojaner (getarnt, Hintertür), Spyware, Ransomware (verschlüsselt und erpresst), Adware, Botnet (ferngesteuerte Rechner, DDoS), Keylogger.

**Schutzbedarfsanalyse:** Schadensszenarien bewerten; Kategorien normal, hoch, sehr hoch (Schaden niedrig bis existenziell bedrohlich); Einflussfaktoren: tolerierbare Ausfallzeit, Notfallpläne, Kumulationseffekte, Verteilungseffekte, Maximalfälle. **Auswahlkriterien für Maßnahmen:** Wirksamkeit, Eignung, Praktikabilität, Akzeptanz, Wirtschaftlichkeit. **Härtung:** unnötige Dienste deaktivieren, Firewall, Patch-Management, Secure Boot.

**Verschlüsselung:** symmetrisch (ein Schlüssel, schnell, Schlüsselaustausch ist das Problem), asymmetrisch (öffentlicher und privater Schlüssel; mit dem öffentlichen Schlüssel des Empfängers verschlüsseln, mit dessen privatem entschlüsseln; sichert Vertraulichkeit, nicht Authentizität).

**Datensicherung:** Voll (alles, einfachste Wiederherstellung, meiste Zeit und Platz), inkrementell (seit letzter Sicherung, wenig Platz, Restore braucht Voll + alle Inkremente), differenziell (seit letzter Vollsicherung, wächst bis zur nächsten Vollsicherung, Restore braucht Voll + letzte Differenz).

**Firewalls:** Stateless (Header: IP, Port, Protokoll), Stateful (zusätzlich Verbindungszustand, State Table), DPI (Inhalt der Pakete), Application-Level (Schicht 7, versteht HTTP, SMTP, FTP, blockiert z. B. SQL-Injection), NGFW (DPI + Anwendungs- und Nutzererkennung, Sandboxing).

**Passwörter:** Länge und Komplexität; regelmäßiger Wechsel wird laut BSI nicht mehr empfohlen (führt zu schwächeren Passwörtern), Wechsel nur bei Verdacht auf Kompromittierung.

### Projektplanung
Projektmerkmale: einmalig, zeitlich begrenzt, klare Problemstellung, komplex mit anfangs unbekanntem Weg. **SMART:** spezifisch, messbar, erreichbar/attraktiv, realistisch/angemessen, terminiert. **Lastenheft** (Auftraggeber: Was und Wofür?) gegenüber **Pflichtenheft** (Auftragnehmer: Wie und Womit?). Stakeholder: Betroffene und Einflussnehmer. Aufbauorganisation (Stellen, Abteilungen, Weisungswege) gegenüber Ablauforganisation (Arbeitsabläufe). Projektstrukturplan (Teilprojekte, Arbeitspakete), Gantt-Diagramm (Balken auf Zeitstrahl), Netzplan:
FAZ = max(FEZ der Vorgänger); FEZ = FAZ + Dauer; SEZ = min(SAZ der Nachfolger); SAZ = SEZ - Dauer; **GP = SAZ - FAZ**; FP = FAZ(Nachfolger) - FEZ. Kritischer Pfad = Vorgänge mit GP 0.
Wirtschaftlichkeit: Nutzen größer als Kosten. Risikoarten: finanziell, zeitlich, technologisch, Sicherheit, organisatorisch, extern. Vorgehensmodelle: Wasserfall (linear, kaum flexibel) und Scrum (iterativ in Sprints; Product Owner, Scrum Master, Entwicklungsteam).

### Hardware und Sonstiges
Auswahl: Leistung (CPU, RAM, SSD), Ergonomie, Barrierefreiheit, Energieeffizienz, Nutzungsdauer, Recycling. CPU = Steuerwerk (CU) + Rechenwerk (ALU) + Cache L1/L2/L3. GPU für massiv parallele Berechnungen. RAM (DDR-SDRAM, Dual-Channel). HDD (magnetisch, günstig pro GB), SSD (Flash, robust, schnell). Thin Client (kaum eigene Leistung). **NAS** (Dateiserver im Netz, Datei-Ebene) gegenüber **SAN** (eigenes Speichernetz, Block-Ebene). Dateisysteme: FAT32 (Datei max. 4 GB), NTFS (Windows), APFS (macOS), ext4 (Linux). BIOS (Firmware, POST) gegenüber UEFI (Nachfolger, GPT, Secure Boot). IoT/IIoT, Sensor (Messgröße zu Signal) und Aktor (Signal zu Aktion), Mikrocontroller (kompletter Computer auf einem Chip) gegenüber Mikroprozessor (nur Rechenkern). **USV:** VFD (Offline), VI (Line-Interactive), VFI (Online, Doppelwandler, bester Schutz).
Support: First Level (Annahme, Standardprobleme), Second Level (Fachwissen), Third Level (Spezialisten, Entwickler, Hersteller). Offline-KI (lokal, maximaler Datenschutz) gegenüber Online-KI (Cloud, aktuell, Daten verlassen das System). Industrie 1.0 Dampf, 2.0 Strom/Fließband, 3.0 Elektronik/IT, 4.0 Vernetzung/IoT/KI/Cyber-Physische Systeme.

### Operatoren (Prüfungstipps)
**Nennen** = Stichworte; **Beschreiben** = ganze Sätze, ohne Begründung; **Erläutern** = ganze Sätze mit Begründung, Beispiel oder Vergleich. Auf Verneinungen, Punkte und Zeit achten.

## Einfach

**Miete, Leasing, Kauf** sind wie Fahrrad: Beim Mieten gibst du es zurück, und der Vermieter repariert. Beim Leasing hast du einen langen Vertrag und zahlst Reparaturen selbst, am Ende kannst du es kaufen. Beim Kauf gehört es dir, aber es verliert an Wert.

**Bezugspreis** ist der echte Preis in der Tasche: Listenpreis, minus Rabatt, minus Skonto (Bonus fürs schnelle Zahlen), plus Fracht.

**Schutzziele**: Geheim bleiben, nicht verändert werden, immer da sein. **Hash** ist ein Fingerabdruck einer Datei. Ändert sich nur ein Zeichen, sieht der Fingerabdruck völlig anders aus. **Zwei-Faktor** ist ein Schloss mit zwei verschiedenen Schlüsseln, zum Beispiel Passwort und Handy.

**Backup-Arten**: Voll ist die komplette Kopie. Inkrementell kopiert nur, was seit gestern neu ist. Differenziell kopiert alles seit der letzten Vollkopie, also von Tag zu Tag mehr.

**Firewall-Arten** sind wie Türsteher: Der einfache schaut nur auf den Ausweis (Header). Der schlauere weiß auch, ob du eingeladen wurdest (Zustand). Der gründliche öffnet sogar deine Tasche (DPI). Der Allrounder kennt dazu noch deine Vorgeschichte (NGFW).

**Lastenheft**: Der Kunde schreibt, was er will. **Pflichtenheft**: Die Firma schreibt, wie sie es machen wird. **Netzplan** zeigt, welche Arbeit auf welche warten muss. **Puffer** ist die Zeit, die ein Vorgang trödeln darf, ohne das Projektende zu verzögern.

**NAS** ist ein Ordner im Netz. **SAN** ist eine ganze Festplatte im Netz, die ein Server wie seine eigene benutzt.

## Merksatz
- Bezugspreis: Liste - Rabatt - Skonto + Bezugskosten.
- Inkrementell: schnell sichern, langsam wiederherstellen. Differenziell: Restore nur zwei Teile.
- Last = Was, Pflicht = Wie.
- GP = SAZ - FAZ, kritischer Pfad hat GP 0.
- NAS = Datei, SAN = Block.
- VFI = Online-USV, bester Schutz.
- Nennen = Stichwort, Beschreiben = Satz, Erläutern = Satz + Begründung.

## Prüfungsfalle
- Skonto vor Rabatt abziehen: Reihenfolge ist Rabatt, dann Skonto.
- Inkrementell und differenziell vertauschen.
- Pseudonymisierung als Anonymisierung ausgeben (pseudonymisierte Daten bleiben personenbezogen).
- Zwei Faktoren aus derselben Kategorie als 2FA werten.
- Passwortwechsel alle 90 Tage als aktuelle BSI-Empfehlung nennen.
- Asymmetrische Verschlüsselung beweist nicht die Identität des Absenders; dafür braucht man eine Signatur.
- SAN mit NAS gleichsetzen.
- Lasten- und Pflichtenheft verwechseln: Das Lastenheft schreibt der Auftraggeber.
- Netzplan: FAZ ist das Maximum der Vorgänger-FEZ, nicht das Minimum.

## Grafik
### Datensicherung über eine Woche
1. Server -> Backup-Speicher: Sonntag Vollsicherung
2. Server -> Backup-Speicher: Montag inkrementell (nur Änderungen seit Sonntag)
3. Server -> Backup-Speicher: Dienstag inkrementell (nur Änderungen seit Montag)
4. Backup-Speicher: Restore am Mittwoch braucht Voll + Montag + Dienstag
5. Server -> Backup-Speicher: Alternative differenziell sichert Dienstag alles seit Sonntag
6. Backup-Speicher: Restore differenziell braucht nur Voll + Dienstag

### Asymmetrische Verschlüsselung
1. Empfänger -> Absender: sendet den öffentlichen Schlüssel
2. Absender: verschlüsselt die Nachricht mit dem öffentlichen Schlüssel
3. Absender -> Empfänger: übermittelt den Geheimtext
4. Empfänger: entschlüsselt mit dem privaten Schlüssel

## Lücken
- Bezugspreis = Listeneinkaufspreis - {Rabatt} - {Skonto} + {Bezugskosten}.
- Das {Lastenheft} schreibt der Auftraggeber, das {Pflichtenheft} der Auftragnehmer.
- Gesamtpuffer = {SAZ} - {FAZ}.
- Bei der {differenziellen} Sicherung werden alle Änderungen seit der letzten Vollsicherung gesichert.
- Die {Online}-USV hat die Bauform VFI.

## Zuordnen
### Malware und Eigenschaft
- Wurm => verbreitet sich selbstständig im Netzwerk
- Trojaner => tarnt sich als nützliche Software
- Ransomware => verschlüsselt Daten und fordert Lösegeld
- Keylogger => zeichnet Tastatureingaben auf
- Botnet => ferngesteuerte Rechner für DDoS

### USV-Typ und Bezeichnung
- VFD => Offline-USV
- VI => Line-Interactive-USV
- VFI => Online-USV

## Reihenfolge
### Support-Eskalation
1. First Level: Ticket aufnehmen
2. Second Level: Fachliche Analyse
3. Third Level: Spezialist oder Hersteller

## Spickzettel
- Bezugspreis: Liste - Rabatt - Skonto + Bezugskosten
- FEZ = FAZ + Dauer, SAZ = SEZ - Dauer, GP = SAZ - FAZ
- Voll > Differenziell > Inkrementell (Restore-Aufwand: klein bis groß)
- Lastenheft Kunde (Was), Pflichtenheft Firma (Wie)
- DSGVO Art. 5: Zweckbindung, Datenminimierung, Richtigkeit, Speicherbegrenzung
- USV: VFD offline, VI line-interactive, VFI online
- BSI: kein regelmäßiger Passwortwechsel mehr
- Nennen, Beschreiben, Erläutern unterscheiden

## Übungen
- A: Listenpreis 1.000 EUR, 10 % Rabatt, 2 % Skonto, 30 EUR Fracht. Bezugspreis? | L: 1.000 - 100 = 900 (Ziel); 900 - 18 = 882 (bar); 882 + 30 = 912 EUR.
- A: Vorgang B: FAZ 5, Dauer 4, SAZ 7. Gesamtpuffer und FEZ? | L: FEZ = 9; GP = SAZ - FAZ = 7 - 5 = 2.
- A: Erläutern Sie den Unterschied zwischen Anonymisierung und Pseudonymisierung. | L: Anonym: kein Personenbezug mehr herstellbar (nicht umkehrbar). Pseudonym: Identifikatoren durch Pseudonyme ersetzt, mit Zusatzinformation wieder zuordenbar; bleibt personenbezogen.

## Karteikarten
- F: Unterschied Miete und Leasing? | A: Miete flexibel, Vermieter wartet; Leasing feste Laufzeit, Leasingnehmer wartet, Kaufoption.
- F: Wie berechnet man den Bezugspreis? | A: Liste - Rabatt - Skonto + Bezugskosten.
- F: Was ist ERP? | A: Zentrale Steuerung aller Geschäftsprozesse wie Einkauf, Produktion, Lager, Buchhaltung.
- F: Datensicherheit vs. Datenschutz? | A: Datensicherheit schützt Daten technisch und organisatorisch; Datenschutz schützt personenbezogene Daten von Personen.
- F: Nennen Sie Betroffenenrechte. | A: Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch.
- F: Differenz zwischen Anonymisierung und Pseudonymisierung? | A: Anonym nicht rückführbar, pseudonym mit Zusatzinformation rückführbar.
- F: Welche Firewall prüft Schicht 7? | A: Application-Level-Firewall.
- F: Was kann eine NGFW zusätzlich? | A: Anwendungs- und Nutzererkennung, Sandboxing.
- F: Vorteil der inkrementellen Sicherung? | A: Geringster Platz und schnellste Sicherung; Restore aber aufwendig.
- F: Was steht im Lastenheft? | A: Anforderungen des Auftraggebers: Was und Wofür.
- F: Was bedeutet SMART? | A: Spezifisch, messbar, erreichbar, angemessen/realistisch, terminiert.
- F: Scrum-Rollen? | A: Product Owner, Scrum Master, Entwicklungsteam.
- F: NAS oder SAN: Block-Zugriff? | A: SAN.
- F: Was ist Secure Boot? | A: UEFI-Funktion, die nur signierte Bootloader startet.
- F: Industrie 4.0 Kernmerkmal? | A: Vernetzung durch IoT, KI und Cyber-Physische Systeme.

## Quiz
? Wie lautet die Rechenreihenfolge zum Bezugspreis?
* Listenpreis - Rabatt - Skonto + Bezugskosten
- Listenpreis - Skonto - Rabatt + Bezugskosten
- Listenpreis + Bezugskosten - Rabatt + Skonto
- Listenpreis - Bezugskosten - Rabatt - Skonto

? Welche Sicherungsart sichert alle Änderungen seit der letzten Vollsicherung?
* Differenziell
- Inkrementell
- Voll
- Spiegelung

? Was beschreibt das Lastenheft?
* Anforderungen des Auftraggebers (Was und Wofür)
- Technische Umsetzung durch den Auftragnehmer
- Netzplan des Projekts
- Kostenrechnung

? Wie berechnet sich der Gesamtpuffer?
* SAZ - FAZ
- SEZ + FAZ
- FEZ - FAZ
- Dauer - SAZ

? Welche Malware verbreitet sich selbstständig ohne Nutzerinteraktion über Netzwerke?
* Wurm
- Trojaner
- Keylogger
- Adware

? Welche USV-Bauform bietet den höchsten Schutz?
* VFI (Online)
- VFD (Offline)
- VI (Line-Interactive)
- VBA

? Was gilt laut BSI heute für Passwörter?
* Kein erzwungener regelmäßiger Wechsel, Wechsel bei Verdacht
- Wechsel alle 30 Tage
- Wechsel alle 90 Tage
- Wechsel nie, auch nicht bei Verdacht

? Was ist ein SAN?
* Eigenes Hochleistungsnetz für gemeinsamen Blockspeicher
- Ein Internetdienst
- Ein WLAN-Standard
- Ein Dateiserver im Heimnetz

? Wozu dient ein Aktor?
* Wandelt ein elektrisches Signal in eine physische Aktion
- Misst physikalische Größen
- Speichert Daten
- Verschlüsselt Daten

? Welche Operatoren-Beschreibung stimmt?
* Erläutern = ganze Sätze mit Begründung oder Beispiel
- Nennen = ausführlicher Aufsatz
- Beschreiben = nur Stichworte
- Erläutern = nur Zahlen

? Welche Aussagen zur Zwei-Faktor-Authentifizierung stimmen? (mehrere)
* Es werden zwei verschiedene Faktorkategorien kombiniert.
* Passwort plus Authenticator-App ist ein Beispiel.
- Zwei Passwörter sind 2FA.
- 2FA ersetzt jede Verschlüsselung.
