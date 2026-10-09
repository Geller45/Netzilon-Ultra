---
id: wiso-datenschutz-dsgvo
bereich: WiSo
block: WiSo
kapitel: Datenschutz und Compliance
titel: Datenschutz – DSGVO, BDSG, TOM und Datenschutzvorfälle
stufe: Fortgeschritten
fach: WiSo
pruefungen: [AP1, AP2]
quellen: [Datenschutz & Compliance.docx, DSGVO.md (Obsidian), BDSG.md (Obsidian), WiSo-Arbeitsschutz-Umwelt-Ethik.md, IT-Sicherheit-Datenschutz.md (Obsidian v2), Lernzettel_AP1AP2_2024.pdf]
verweise: [wiso-arbeitsschutz, wiso-organisation, wiso-projektwirtschaft]
---

## Profi

### Begriffe
- **Personenbezogene Daten** (Art. 4 DSGVO): alle Informationen zu einer identifizierten oder identifizierbaren natürlichen Person (Name, E-Mail, IP-Adresse, Standortdaten, Kennnummer). **Besondere Kategorien** (Art. 9): Gesundheit, Religion, Biometrie, politische Meinung, Gewerkschaft: besonders geschützt.
- **Verantwortlicher** (entscheidet über Zweck/Mittel), **Auftragsverarbeiter** (verarbeitet im Auftrag, **AV-Vertrag nach Art. 28**), **Betroffener**.
- **Datenschutz** schützt Personen (Persönlichkeitsrecht), **Datensicherheit/Informationssicherheit** schützt Daten (VCIA).

### Grundsätze (Art. 5)
Rechtmäßigkeit, Verarbeitung nach Treu und Glauben, Transparenz, **Zweckbindung**, **Datenminimierung**, **Richtigkeit**, **Speicherbegrenzung** (Löschfristen), **Integrität und Vertraulichkeit**, **Rechenschaftspflicht**.
**Rechtsgrundlagen (Art. 6)**: Einwilligung (freiwillig, informiert, widerrufbar), Vertragserfüllung, rechtliche Verpflichtung, lebenswichtige Interessen, öffentliches Interesse, berechtigtes Interesse. Verbot mit Erlaubnisvorbehalt.

### Rechte der Betroffenen
Auskunft (Art. 15), Berichtigung (16), Löschung / „Recht auf Vergessenwerden“ (17), Einschränkung (18), Datenübertragbarkeit (20), Widerspruch (21), keine ausschließlich automatisierte Entscheidung (22). Informationspflicht (13/14).

### Pflichten des Verantwortlichen
- **Verzeichnis von Verarbeitungstätigkeiten (Art. 30)**.
- **Datenschutz-Folgenabschätzung (DSFA, Art. 35)** bei hohem Risiko.
- **Datenschutz durch Technik und Voreinstellungen** (Privacy by Design/Default, Art. 25).
- **Meldung einer Verletzung** an die Aufsichtsbehörde binnen **72 Stunden** (Art. 33), Benachrichtigung der Betroffenen bei hohem Risiko (Art. 34).
- **Datenschutzbeauftragter (DSB)**: nach § 38 BDSG bestellen, wenn mind. **20 Personen** ständig automatisiert personenbezogene Daten verarbeiten (oder DSFA/Kerntätigkeit). Aufgaben: Beraten, Überwachen, Schulen, Ansprechpartner der Behörde; weisungsfrei, Stabsstelle.
- **Bußgeld** bis **20 Mio. €** oder **4 % des weltweiten Jahresumsatzes** (je nachdem, was höher ist).
- **BDSG** ergänzt die DSGVO (z. B. Beschäftigtendatenschutz § 26, Videoüberwachung); **TDDDG/TKG** für Telekommunikation/Cookies.

### Pseudonymisierung vs. Anonymisierung
- **Pseudonymisierung**: Identifikatoren durch Kennung ersetzen; mit Zusatzinformation (Zuordnungstabelle) umkehrbar, Daten bleiben personenbezogen.
- **Anonymisierung**: Personenbezug unwiderruflich entfernt, DSGVO gilt nicht mehr.

### Technisch-organisatorische Maßnahmen (TOM, Art. 32)
| Kontrolle | Ziel | Beispiele |
|---|---|---|
| **Zutrittskontrolle** | Unbefugten Zutritt zu Räumen verwehren | Alarmanlage, RFID-Karte, Besucherregistrierung, Schloss |
| **Zugangskontrolle** | Unbefugte Systemnutzung verhindern | Passwort, MFA, Biometrie, Sperrbildschirm |
| **Zugriffskontrolle** | Unbefugtes Lesen/Ändern von Daten | Berechtigungskonzept, Verschlüsselung, Rollen |
| **Weitergabekontrolle** | Schutz beim Transport | VPN, TLS, Verschlüsselung |
| **Eingabekontrolle** | Nachvollziehbarkeit von Änderungen | Protokollierung |
| **Auftragskontrolle** | Weisungsgebundene Verarbeitung | AV-Vertrag |
| **Verfügbarkeitskontrolle** | Schutz vor Verlust | Backup, USV, RAID |
| **Trennungsgebot** | Getrennte Verarbeitung nach Zweck | Mandantentrennung |
Moderne Prinzipien: **Least Privilege**, **Zero Trust**, Systemhärtung (nicht benötigte Dienste aus, Secure Boot, TPM 2.0).

### Verhalten bei Datenpanne
1. Vorfall erkennen und eindämmen (z. B. Mail zurückrufen). 2. DSB/Verantwortlichen informieren. 3. Risiko bewerten. 4. Meldung an Aufsichtsbehörde innerhalb 72 h, ggf. Betroffene informieren. 5. Dokumentieren.

## Einfach

Stell dir vor, deine Schule hat eine Liste mit deinem Namen, deiner Adresse und deinen Noten. Das sind **personenbezogene Daten**, sie gehören DIR. Die **DSGVO** ist das europäische Gesetz, das regelt, wie Firmen mit solchen Daten umgehen müssen.

**Die wichtigsten Regeln (Spielregeln):**
- **Zweckbindung:** Die Daten dürfen nur für den Grund genutzt werden, für den sie erhoben wurden. Wer deine Adresse für ein Paket bekommt, darf sie nicht für Werbung nutzen.
- **Datensparsamkeit:** Nur so viel fragen, wie nötig. Warum soll ein Online-Shop deine Schuhgröße UND Religion wissen?
- **Löschen:** Wenn der Grund weg ist, müssen die Daten gelöscht werden.
- **Einwilligung:** Du musst „Ja“ sagen dürfen, und später auch wieder „Nein“.

**Deine Rechte:** Du darfst fragen „Was habt ihr über mich gespeichert?“ (Auskunft), Fehler korrigieren lassen, und verlangen, dass sie gelöscht werden.

**Wenn etwas schiefgeht:** Du schickst aus Versehen eine Kunden-Mail an die falsche Person. Dann: Schnell reagieren (zurückrufen), Chef und Datenschutzbeauftragten informieren, und wenn nötig innerhalb von **72 Stunden** der Behörde melden.

**Datenschutzbeauftragter:** Der „Schiedsrichter“ in der Firma. Er passt auf, dass alle sich an die Regeln halten, aber er ist kein Chef, er berät nur. Pflicht ab 20 Personen, die regelmäßig mit Computerdaten arbeiten.

**Schutzmaßnahmen (TOM):** Wie bei einem Haus: Haustür abschließen (Zutritt), Tresor mit Code (Zugang), nur bestimmte Schlüssel für bestimmte Schränke (Zugriff).

**Pseudonymisieren** heißt: Statt „Max Müller“ steht „Kunde 4711“ da. Mit der Namensliste kann man zurückrechnen. **Anonymisieren** heißt: Die Namensliste wird vernichtet, niemand kann je wieder erkennen, wer es war.

## Merksatz
- Zweck – Minimierung – Löschen: die drei Kernregeln.
- Zutritt = Raum, Zugang = System, Zugriff = Daten.
- Meldung binnen 72 Stunden.
- Pseudonym = rückholbar, anonym = nie wieder.
- Bußgeld: 20 Mio. oder 4 %.

## Prüfungsfalle
- **Datenschutz ≠ Datensicherheit**. DSGVO schützt Personen, VCIA schützt Informationen.
- Zutritts-, Zugangs- und Zugriffskontrolle sauber trennen (häufige Zuordnungsaufgabe).
- IP-Adressen sind personenbezogen.
- Gesundheitsdaten darf der Arbeitgeber nicht lesen, nur „geeignet/nicht geeignet“.
- Pseudonymisierte Daten gelten weiter als personenbezogen.
- DSB: nur mit Weisungsfreiheit; der Geschäftsführer oder IT-Leiter kann nicht DSB sein (Interessenkonflikt).

## Grafik
### Datenpanne richtig behandeln
1. Mitarbeiter: Fehlversand einer Kundenliste entdeckt
2. Mitarbeiter -> Datenschutzbeauftragter: Sofortige Meldung
3. Datenschutzbeauftragter: Risiko bewerten
4. Verantwortlicher -> Aufsichtsbehörde: Meldung binnen 72 Stunden
5. Verantwortlicher -> Betroffene: Information bei hohem Risiko
6. Datenschutzbeauftragter: Vorfall dokumentieren

## Spickzettel
- Grundsätze: Zweckbindung, Datenminimierung, Speicherbegrenzung, Integrität
- Rechte: Auskunft, Berichtigung, Löschung, Widerspruch, Übertragbarkeit
- Panne: 72 h an Behörde
- DSB ab 20 Personen
- TOM: Zutritt, Zugang, Zugriff, Weitergabe, Eingabe, Auftrag, Verfügbarkeit, Trennung
- Bußgeld 20 Mio. / 4 %

## Zuordnen
### TOM-Kontrollen
- Alarmanlage => Zutrittskontrolle
- Passwort/MFA => Zugangskontrolle
- Berechtigungskonzept => Zugriffskontrolle
- VPN-Tunnel => Weitergabekontrolle
- Protokollierung => Eingabekontrolle
- Backup => Verfügbarkeitskontrolle

## Freitext
- F: Nennen Sie drei Grundsätze der DSGVO. | M: Zweckbindung, Datenminimierung, Speicherbegrenzung (alternativ Transparenz, Richtigkeit, Integrität/Vertraulichkeit) | P: 3
- F: Erläutern Sie den Unterschied zwischen Anonymisierung und Pseudonymisierung. | M: Pseudonymisierung ersetzt Merkmale durch Kennung, mit Zuordnungstabelle umkehrbar; Anonymisierung entfernt Personenbezug unwiderruflich | P: 2
- F: Nennen Sie zwei Maßnahmen nach einem Fehlversand von Kundendaten. | M: Mail zurückrufen/Empfänger zur Löschung auffordern; DSB informieren; Vorfall dokumentieren; ggf. Meldung in 72 h | P: 2

## Karteikarten
- F: Was sind personenbezogene Daten? | A: Informationen zu einer identifizierten oder identifizierbaren natürlichen Person
- F: Frist zur Meldung einer Datenpanne? | A: 72 Stunden an die Aufsichtsbehörde
- F: Wann ist ein DSB Pflicht? | A: Ab 20 Personen, die ständig personenbezogene Daten automatisiert verarbeiten
- F: Zweckbindung? | A: Daten nur für den Zweck verwenden, für den sie erhoben wurden
- F: Datenminimierung? | A: Nur notwendige Daten erheben
- F: Pseudonymisierung vs. Anonymisierung? | A: Pseudonym: umkehrbar mit Zusatzinfo; anonym: unumkehrbar
- F: Zutrittskontrolle? | A: Verwehrt Unbefugten den Zutritt zu Räumen (Alarmanlage, Chipkarte)
- F: Zugangskontrolle? | A: Verhindert unbefugte Systemnutzung (Passwort, Biometrie)
- F: Zugriffskontrolle? | A: Verhindert unbefugtes Lesen/Ändern von Daten (Berechtigungen, Verschlüsselung)
- F: Maximales Bußgeld DSGVO? | A: 20 Mio. € oder 4 % des weltweiten Jahresumsatzes
- F: Least Privilege? | A: Nur minimal nötige Rechte vergeben
- F: Zero Trust? | A: Niemandem automatisch vertrauen, jede Anfrage verifizieren

## Quiz
? Welche Frist gilt für die Meldung einer Datenschutzverletzung an die Aufsichtsbehörde?
* 72 Stunden
- 24 Stunden
- 7 Tage
- 30 Tage

? Was bedeutet Zweckbindung?
* Daten dürfen nur für den ursprünglichen Erhebungszweck genutzt werden
- Daten müssen für immer gespeichert werden
- Daten dürfen frei weitergegeben werden
- Daten werden verkauft

? Was ist ein Beispiel für Zutrittskontrolle?
* RFID-Chipkarte für das Gebäude
- Passwortregeln am PC
- Dateiberechtigungen
- Verschlüsselung der Festplatte

? Was ist ein Beispiel für Zugriffskontrolle?
* Berechtigungskonzept auf Dateiebene
- Alarmanlage
- Besucherempfang
- Pförtner

? Was beschreibt die Pseudonymisierung?
* Ersetzen von Merkmalen durch Kennungen, mit Zuordnungstabelle umkehrbar
- Unwiderrufliches Löschen des Personenbezugs
- Verschlüsselte Übertragung
- Backup der Daten

? Wie hoch ist das maximale Bußgeld nach DSGVO?
* 20 Mio. € oder 4 % des Jahresumsatzes
- 1 Mio. €
- 100.000 €
- 50 Mio. € fest

? Ab wann muss in Deutschland ein Datenschutzbeauftragter bestellt werden?
* Ab 20 Personen, die ständig automatisiert personenbezogene Daten verarbeiten
- Ab 2 Mitarbeitern
- Ab 100 Mitarbeitern
- Nur bei Aktiengesellschaften

? Welches Prinzip bedeutet, nur die minimal nötigen Rechte zu vergeben?
* Least Privilege
- Zero Trust
- Defense in Depth
- Security by Obscurity

? Welcher Vertrag ist bei Auftragsverarbeitung nötig?
* AV-Vertrag nach Art. 28 DSGVO
- Arbeitsvertrag
- Mietvertrag
- Lizenzvertrag
