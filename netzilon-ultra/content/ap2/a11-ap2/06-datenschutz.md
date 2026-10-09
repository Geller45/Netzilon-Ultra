---
id: ap2-datenschutz
bereich: AP2
block: A11
kapitel: Datenschutz
titel: Datenschutz (DSGVO, BDSG, TOM, Betroffenenrechte)
stufe: Fortgeschritten
quellen: [DSGVO, BDSG, IHK-Prüfungskatalog]
verweise: [ap2-it-sicherheit, ap2-vertraege, ap2-kryptografie]
---

## Profi

### Begriffe
| Begriff | Bedeutung |
|---|---|
| **Personenbezogene Daten** (Art. 4) | **Jede Information** über eine **identifizierte oder identifizierbare** Person (Name, E-Mail, IP-Adresse, Kfz-Kennzeichen) |
| **Besondere Kategorien** (Art. 9) | **Gesundheit, Religion, ethnische Herkunft, politische Meinung, Gewerkschaft, Sexualleben, genetische/biometrische Daten** – **besonders geschützt** |
| **Verarbeitung** | **Jeder Vorgang**: Erheben, Speichern, Ändern, Übermitteln, Löschen |
| **Verantwortlicher** | Entscheidet über **Zweck und Mittel** |
| **Auftragsverarbeiter** | Verarbeitet **im Auftrag** (**AVV** nötig, Art. 28) |
| **Pseudonymisierung** | **Zuordnung nur mit Zusatzwissen** – **weiter personenbezogen** |
| **Anonymisierung** | **Kein Personenbezug mehr** – **DSGVO gilt nicht** |

### Grundsätze (Art. 5)
**Rechtmäßigkeit, Treu und Glauben, Transparenz** · **Zweckbindung** · **Datenminimierung** · **Richtigkeit** · **Speicherbegrenzung** · **Integrität und Vertraulichkeit** · **Rechenschaftspflicht**.

### Rechtsgrundlagen (Art. 6)
**Einwilligung** (freiwillig, informiert, widerrufbar) · **Vertragserfüllung** · **rechtliche Verpflichtung** · **lebenswichtige Interessen** · **öffentliche Aufgabe** · **berechtigtes Interesse** (Abwägung). **Beschäftigtendaten**: **§ 26 BDSG** (Anwendung eingeschränkt, Art. 88 DSGVO).

### Betroffenenrechte
**Information** (Art. 13/14), **Auskunft** (Art. 15, **innerhalb 1 Monat**), **Berichtigung** (16), **Löschung/„Vergessenwerden“** (17), **Einschränkung** (18), **Datenübertragbarkeit** (20), **Widerspruch** (21), **keine rein automatisierte Entscheidung** (22), **Beschwerde bei Aufsichtsbehörde** (77).

### Pflichten des Verantwortlichen
- **Verzeichnis von Verarbeitungstätigkeiten** (Art. 30).
- **TOM** (Art. 32) **nach Stand der Technik**.
- **Datenschutz durch Technik und Voreinstellungen** (Art. 25, **Privacy by Design/Default**).
- **Datenschutz-Folgenabschätzung (DSFA)** (Art. 35) bei **hohem Risiko**.
- **Meldung von Datenpannen** an **Aufsichtsbehörde binnen 72 h** (Art. 33), **Betroffene** bei **hohem Risiko** (Art. 34).
- **Datenschutzbeauftragter (DSB)**: in DE, wenn **mindestens 20 Personen ständig** mit **automatisierter Verarbeitung** beschäftigt sind (**§ 38 BDSG**) oder Kerntätigkeit mit **umfangreicher Verarbeitung** besonderer Daten/Überwachung.
- **Drittlandübermittlung** nur mit **Angemessenheitsbeschluss** (USA: **EU-U.S. Data Privacy Framework** für zertifizierte Firmen), **Standardvertragsklauseln**, **BCR**.

### Bußgelder (Art. 83)
Bis **20 Mio. €** oder **4 % des weltweiten Jahresumsatzes** (höherer Wert); leichtere Verstöße bis **10 Mio. € / 2 %**.

### TOM (Art. 32) – typische Ziele
| Ziel | Maßnahmen |
|---|---|
| **Vertraulichkeit** | **Zutrittskontrolle** (Gebäude), **Zugangskontrolle** (Anmeldung am System), **Zugriffskontrolle** (Rechte auf Daten), **Trennungskontrolle**, **Pseudonymisierung/Verschlüsselung** |
| **Integrität** | **Weitergabekontrolle** (Transport/Übertragung, VPN/TLS), **Eingabekontrolle** (Protokoll: wer hat was eingegeben) |
| **Verfügbarkeit/Belastbarkeit** | **Backup, USV, Redundanz, Virenschutz**, **rasche Wiederherstellbarkeit** |
| **Überprüfung** | **Regelmäßige Tests/Evaluierung**, **Auftragskontrolle** |

**Merk**: **Zutritt = Raum**, **Zugang = System**, **Zugriff = Daten**.

### Löschen
**DIN 66399**: **Schutzklassen 1–3**, **Sicherheitsstufen P-1 bis P-7** (Papier), **H**, **O**, **E**, **T** für Datenträger. **HDD**: **mehrfach überschreiben / Degausser / Zerstören**. **SSD**: **Secure Erase / Crypto Erase / Zerstören** (Überschreiben unzuverlässig).

### Löschfristen (Beispiele, handels-/steuerrechtlich)
**Buchungsbelege/Rechnungen 8 Jahre** (seit 2025), **Handelsbücher/Jahresabschlüsse 10 Jahre**, **Handels-/Geschäftsbriefe 6 Jahre**.

## Einfach
Datenschutz schützt **Menschen**, IT-Sicherheit schützt **Daten/Systeme**. Die DSGVO ist die **Hausordnung für fremde Daten**: **Nur sammeln, was du brauchst** (**Datenminimierung**), **nur dafür nutzen** (**Zweckbindung**) und **nicht ewig behalten**. Jeder darf fragen: „**Was weißt du über mich?**“ – und du musst **in einem Monat** antworten.

## Merksatz
- **Zutritt – Zugang – Zugriff: Raum – System – Daten**.
- **Datenpanne: 72 h**.
- **Auskunft: 1 Monat**.
- **DSB ab 20 Personen**.
- **20 Mio. oder 4 %**.
- **Pseudonym = noch DSGVO**, **anonym = keine DSGVO**.

## Prüfungsfalle
- **IP-Adresse** ist **personenbezogen**.
- **Pseudonymisiert** ist **nicht anonym**.
- **Einwilligung** muss **freiwillig** und **widerrufbar** sein.
- **Zugangs- und Zugriffskontrolle** verwechselt.
- **Meldung 72 h an Behörde**, **nicht an jeden Betroffenen automatisch**.
- **Datenschutz ≠ Datensicherheit**.

## Grafik
### Drei Türen
Haustür (Zutritt), Login-Bildschirm (Zugang), Aktenschrank mit Rechten (Zugriff).

### Stoppuhr
72-h-Uhr bei Datenpanne, 1-Monats-Kalender bei Auskunft.

## Karteikarten
- F: Was sind personenbezogene Daten? | A: Informationen über eine identifizierte oder identifizierbare natürliche Person.
- F: Nenne besondere Kategorien nach Art. 9. | A: Gesundheit, Religion, ethnische Herkunft, politische Meinung, biometrische Daten.
- F: Frist für Meldung einer Datenpanne? | A: 72 Stunden an die Aufsichtsbehörde.
- F: Frist für Auskunft? | A: Ein Monat.
- F: Wann braucht man in DE einen DSB? | A: Ab 20 Personen, die ständig automatisiert Daten verarbeiten.
- F: Unterschied Zugangs- und Zugriffskontrolle? | A: Zugang = System nutzen, Zugriff = auf bestimmte Daten.
- F: Höchstes Bußgeld? | A: 20 Mio. € oder 4 % des Jahresumsatzes.
- F: Was ist eine DSFA? | A: Datenschutz-Folgenabschätzung bei hohem Risiko.
- F: Wie löscht man SSDs sicher? | A: Secure Erase, Crypto Erase oder physische Zerstörung.

## Quiz
? Wie lange hat ein Unternehmen Zeit, eine Datenpanne der Behörde zu melden?
* 72 Stunden
- 24 Stunden
- 1 Monat
- 14 Tage

? Welche Maßnahme ist Zutrittskontrolle?
* Chipkarte an der Serverraumtür
- Passwort am PC
- NTFS-Rechte
- Verschlüsselte E-Mail

? Welche Daten sind nicht mehr personenbezogen?
* Anonymisierte Daten
- Pseudonymisierte Daten
- IP-Adressen
- E-Mail-Adressen

? Welcher Grundsatz verlangt, nur nötige Daten zu erheben?
* Datenminimierung
- Zweckbindung
- Transparenz
- Richtigkeit

? Was braucht man, wenn ein Cloudanbieter Kundendaten verarbeitet?
* Auftragsverarbeitungsvertrag
- Werkvertrag
- Garantie
- Leasingvertrag
