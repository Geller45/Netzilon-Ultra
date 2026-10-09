---
id: wiso-p2-nachhaltigkeit-datenschutz
bereich: WiSo
block: WiSo
kapitel: WiSo – IHK-Prüfungstraining
titel: Nachhaltigkeit, Umwelt- & Datenschutz im Betrieb – Drei Säulen, Green IT, ElektroG, DSGVO, Betroffenenrechte, TOM
stufe: Einsteiger
fach: WiSo
pruefungen: [AP2, WiSo]
quellen: [DSGVO Art. 4–7, 9, 12–22, 25, 28, 30, 32–35, 37, 83, BDSG § 38, ElektroG (Elektro- und Elektronikgerätegesetz), KrWG § 6 (Abfallhierarchie), BattDG, EnEfG (Energieeffizienzgesetz), DIN 66399, UN-Agenda 2030, Gratzke/Hauser IT-Berufe Grundstufe Kap. 3]
verweise: [wiso-datenschutz-dsgvo, ap2-datenschutz, wiso-arbeitsschutz, ap2-it-sicherheit, wiso-p2-markt-wirtschaftspolitik, wiso-p2-organisation-kennzahlen]
---

## Profi

### Nachhaltigkeit – das Drei-Säulen-Modell
**Nachhaltige Entwicklung** (sustainable development) nach dem **Brundtland-Bericht (1987)**: Eine Entwicklung, die die Bedürfnisse der Gegenwart befriedigt, ohne zu riskieren, dass künftige Generationen ihre eigenen Bedürfnisse nicht befriedigen können.
| Säule | Ziel | Beispiele im IT-Betrieb |
|---|---|---|
| **Ökologie** | Umwelt und Ressourcen schonen | Energieeffiziente Server, Abwärmenutzung, Recycling, Reparatur statt Neukauf, papierloses Büro |
| **Ökonomie** | dauerhaft wirtschaftlich erfolgreich sein | Senkung der Energiekosten, langlebige Geräte (geringere TCO), stabile Lieferketten |
| **Soziales** | faire Arbeitsbedingungen, Gesundheit, Teilhabe | Ergonomische Arbeitsplätze, Weiterbildung, faire Lieferketten (Rohstoffe für Hardware), Barrierefreiheit |

Weitere Rahmen: Die **UN-Agenda 2030** mit **17 Nachhaltigkeitszielen (SDGs)**; das **Lieferkettensorgfaltspflichtengesetz** (LkSG) für große Unternehmen; EU-Vorgaben zur **Nachhaltigkeitsberichterstattung** (CSRD) für große Unternehmen. Ziel: Ökologie, Ökonomie und Soziales **im Gleichgewicht** – Zielkonflikte sind möglich (z. B. teurere, aber langlebige Hardware).

### Green IT
**Green IT** bezeichnet die umwelt- und ressourcenschonende Gestaltung von Herstellung, Nutzung und Entsorgung der IT („Green **in** IT“) sowie den Einsatz von IT, um Ressourcen zu sparen („Green **by** IT“, z. B. Videokonferenz statt Dienstreise).
- **Beschaffung**: Umweltzeichen und Labels beachten – **Blauer Engel**, **TCO Certified**, **Energy Star**, **EPEAT**, EU-Energielabel; Reparierbarkeit, Ersatzteilverfügbarkeit, **Refurbished-Geräte**.
- **Betrieb**: **Virtualisierung und Serverkonsolidierung**, Energiesparmodi und Power-Management, **Thin Clients**, bedarfsgerechte Kühlung (Kalt-/Warmgang-Einhausung), Abschaltung ungenutzter Systeme, Cloud-Rechenzentren mit erneuerbarer Energie.
- **Kennzahl PUE** (Power Usage Effectiveness) = **Gesamtenergie des Rechenzentrums ÷ Energie der IT-Geräte**. Idealwert **1,0**; je näher an 1, desto weniger Energie geht in Kühlung, USV-Verluste und Beleuchtung. Das **Energieeffizienzgesetz (EnEfG)** stellt Anforderungen an Rechenzentren (u. a. PUE-Grenzwerte, Anteil erneuerbarer Energie, Abwärmenutzung).
- **Lebensdauer verlängern**: Die meisten Treibhausgasemissionen eines Notebooks entstehen bei der **Herstellung** – längere Nutzung ist oft die nachhaltigste Maßnahme.
- **Rebound-Effekt**: Effizienzgewinne werden durch Mehrverbrauch aufgezehrt (sparsamere Server → mehr Server).

### Entsorgung von IT-Geräten
- **Abfallhierarchie** (§ 6 KrWG): **1. Vermeidung**, **2. Vorbereitung zur Wiederverwendung**, **3. Recycling**, **4. sonstige Verwertung** (z. B. energetisch), **5. Beseitigung**.
- **ElektroG**: Elektroaltgeräte gehören **nicht in den Hausmüll** (Symbol: **durchgestrichene Mülltonne**). **Hersteller** müssen sich bei der **stiftung ear** registrieren (WEEE-Reg.-Nr.) und Geräte zurücknehmen. **Rücknahmepflicht des Handels**: Händler mit mind. **400 m²** Verkaufsfläche für Elektrogeräte (bzw. Lager- und Versandfläche im Onlinehandel; Lebensmittelhändler ab 800 m² Gesamtfläche, die Elektrogeräte verkaufen) nehmen **kleine Altgeräte (keine Kante über 25 cm) kostenlos ohne Neukauf** zurück (bis 3 Stück je Geräteart) und **größere Geräte beim Kauf eines gleichwertigen Neugeräts (1:1)**. Gewerbliche Altgeräte (B2B) werden über Hersteller bzw. zertifizierte Entsorger entsorgt.
- **Batterien und Akkus** separat nach dem **Batterierecht** (BattDG) zurückgeben.
- **Datenschutz bei der Entsorgung**: Der Besitzer ist für die **Löschung personenbezogener Daten** vor der Abgabe verantwortlich. Datenträger sicher löschen (Überschreiben, Secure Erase, Kryptolöschung) oder physisch vernichten nach **DIN 66399** (Schutzklassen 1–3, Sicherheitsstufen 1–7; z. B. **H** für Festplatten, **E** für SSD/elektronische Datenträger, **P** für Papier). Vernichtung dokumentieren (**Vernichtungsprotokoll**).

### Datenschutz nach DSGVO
**Personenbezogene Daten** (Art. 4 Nr. 1): alle Informationen, die sich auf eine **identifizierte oder identifizierbare natürliche Person** beziehen (Name, E-Mail, IP-Adresse, Personalnummer, Standort). **Besondere Kategorien** (Art. 9): Gesundheit, Religion, Gewerkschaftszugehörigkeit, ethnische Herkunft, biometrische und genetische Daten – Verarbeitung grundsätzlich verboten, nur mit Ausnahmen.

**Grundsätze (Art. 5 DSGVO):**
1. **Rechtmäßigkeit, Verarbeitung nach Treu und Glauben, Transparenz**
2. **Zweckbindung** – nur für festgelegte, eindeutige Zwecke
3. **Datenminimierung** – nur so viele Daten wie nötig
4. **Richtigkeit** – sachlich richtig und aktuell
5. **Speicherbegrenzung** – nur so lange wie nötig, dann löschen
6. **Integrität und Vertraulichkeit** – Schutz durch geeignete technische und organisatorische Maßnahmen
7. **Rechenschaftspflicht** – der Verantwortliche muss die Einhaltung **nachweisen** können

**Rechtsgrundlagen (Art. 6 Abs. 1)**: **Einwilligung** (freiwillig, informiert, widerrufbar – Art. 7), **Vertragserfüllung**, **rechtliche Verpflichtung** (z. B. Lohnsteuer), **lebenswichtige Interessen**, **öffentliche Aufgabe**, **berechtigtes Interesse** (mit Interessenabwägung). Ohne Rechtsgrundlage ist jede Verarbeitung verboten (**Verbot mit Erlaubnisvorbehalt**).

**Betroffenenrechte:**
| Recht | Artikel | Inhalt |
|---|---|---|
| Information | Art. 13/14 | Bei Erhebung informieren (Zweck, Rechtsgrundlage, Speicherdauer, Rechte) |
| **Auskunft** | Art. 15 | Welche Daten werden verarbeitet, wozu, an wen, wie lange? Kopie der Daten |
| **Berichtigung** | Art. 16 | Falsche Daten korrigieren |
| **Löschung** („Recht auf Vergessenwerden“) | Art. 17 | Löschen, wenn Zweck entfallen, Einwilligung widerrufen, unrechtmäßig verarbeitet |
| **Einschränkung** | Art. 18 | Daten sperren statt löschen (z. B. während Prüfung) |
| **Datenübertragbarkeit** | Art. 20 | Daten in strukturiertem, maschinenlesbarem Format erhalten |
| **Widerspruch** | Art. 21 | gegen Verarbeitung aus berechtigtem Interesse, Direktwerbung |
| Keine rein automatisierte Entscheidung | Art. 22 | Recht auf menschliche Überprüfung |
| Beschwerde | Art. 77 | bei der **Aufsichtsbehörde** (Landesdatenschutzbeauftragte) |

Antwortfrist für Anträge: **unverzüglich, spätestens innerhalb eines Monats** (Art. 12 Abs. 3), in komplexen Fällen um zwei Monate verlängerbar; grundsätzlich **unentgeltlich**.

**Pflichten des Unternehmens (Auswahl):**
- **Verzeichnis von Verarbeitungstätigkeiten** (Art. 30)
- **Auftragsverarbeitungsvertrag** (AVV, Art. 28) mit Dienstleistern, z. B. Cloud-Anbieter, externer IT-Support
- **Datenschutz durch Technikgestaltung und datenschutzfreundliche Voreinstellungen** (Privacy by Design/Default, Art. 25)
- **Datenschutz-Folgenabschätzung** bei hohem Risiko (Art. 35)
- **Datenschutzbeauftragter**, wenn in der Regel mindestens **20 Personen ständig** mit der automatisierten Verarbeitung personenbezogener Daten beschäftigt sind (§ 38 BDSG) oder bei Kerntätigkeit mit umfangreicher Verarbeitung (Art. 37)
- **Meldung von Datenpannen** an die Aufsichtsbehörde **binnen 72 Stunden** nach Bekanntwerden (Art. 33), bei hohem Risiko zusätzlich **Benachrichtigung der Betroffenen** (Art. 34)
- **Bußgelder** bis **20 Mio. € oder 4 % des weltweiten Jahresumsatzes** (je nachdem, was höher ist, Art. 83)

### Technische und organisatorische Maßnahmen (TOM, Art. 32)
Art. 32 nennt u. a. **Pseudonymisierung und Verschlüsselung**, Sicherstellung von **Vertraulichkeit, Integrität, Verfügbarkeit und Belastbarkeit**, rasche **Wiederherstellbarkeit** nach Zwischenfällen und ein **Verfahren zur regelmäßigen Überprüfung**. In der Praxis werden TOM oft nach den klassischen Kontrollzielen gegliedert:
| Kontrollziel | Frage | Maßnahmen |
|---|---|---|
| **Zutrittskontrolle** | Wer kommt in die **Räume**? | Schlüssel, Chipkarten, Serverraum abschließen, Videoüberwachung, Besucherbuch |
| **Zugangskontrolle** | Wer kommt an die **Systeme**? | Passwortrichtlinie, MFA, Bildschirmsperre, Kontosperre |
| **Zugriffskontrolle** | Wer darf welche **Daten** sehen/ändern? | Berechtigungskonzept (NTFS/Gruppen), Need-to-know, Protokollierung |
| **Weitergabekontrolle** | Wie werden Daten sicher **übertragen/transportiert**? | VPN, TLS, verschlüsselte USB-Sticks, E-Mail-Verschlüsselung |
| **Eingabekontrolle** | Wer hat wann was **eingegeben/geändert**? | Audit-Logs, Versionierung |
| **Auftragskontrolle** | Hält der **Dienstleister** sich an Weisungen? | AV-Vertrag, Kontrollen |
| **Verfügbarkeitskontrolle** | Sind Daten vor **Verlust** geschützt? | Backup (3-2-1), USV, RAID, Virenschutz, Brandschutz |
| **Trennungsgebot** | Werden Daten **zweckgetrennt** verarbeitet? | Mandantentrennung, getrennte Test- und Produktivsysteme |

## Einfach
**Nachhaltig** heißt: so leben und arbeiten, dass auch deine Kinder und Enkel noch eine gute Welt haben. Das hat drei Seiten, wie ein Hocker mit drei Beinen: **Umwelt** schützen, **genug Geld** verdienen und **fair zu Menschen** sein. Fehlt ein Bein, kippt der Hocker.

In der IT heißt das **Green IT**. Computer brauchen Strom – sehr viel Strom, vor allem große Rechenzentren. Man kann sparen: Statt zehn Server, die kaum etwas tun, nimmt man einen starken Server und lässt darauf zehn „virtuelle“ laufen. Man schaltet Geräte aus, die keiner braucht. Und man kauft Geräte mit Umweltzeichen wie dem **Blauen Engel**. Am allerbesten ist es aber, Geräte **lange zu benutzen** – denn beim Bauen eines Laptops wird am meisten Energie verbraucht.

Wenn ein Gerät kaputt ist, darf es **nicht in den normalen Müll**. Das Bild mit der **durchgestrichenen Mülltonne** sagt dir das. Große Elektroläden müssen alte Geräte zurücknehmen. Ganz wichtig: Vorher müssen alle **Daten gelöscht** oder die Festplatte zerstört werden – sonst kann ein Fremder deine Fotos oder Kundendaten lesen.

Und damit sind wir beim **Datenschutz**. Daten über Menschen – Name, Adresse, Geburtstag, sogar die IP-Adresse – gehören den Menschen selbst. Eine Firma darf sie nur benutzen, wenn sie einen guten Grund hat oder du **Ja** gesagt hast. Sie darf nur so viele sammeln, wie sie wirklich braucht, und muss sie löschen, wenn sie nicht mehr gebraucht werden.

Du hast auch **Rechte**: Du darfst fragen „Was wisst ihr über mich?“ (**Auskunft**), falsche Daten korrigieren lassen und verlangen, dass sie gelöscht werden. Die Firma muss innerhalb **eines Monats** antworten.

Damit niemand die Daten stiehlt, braucht die Firma **Schlösser** – echte und digitale: abgeschlossene Serverräume, gute Passwörter, Verschlüsselung und Backups. Das nennt man **TOM** – technische und organisatorische Maßnahmen. Und wenn doch etwas passiert, muss die Firma das innerhalb von **72 Stunden** der Datenschutzbehörde melden.

## Merksatz
- **Ökologie – Ökonomie – Soziales: drei Beine, ein Hocker.**
- **Vermeiden vor Wiederverwenden vor Recyceln vor Verbrennen vor Beseitigen.**
- **PUE = Gesamt durch IT – je näher an 1, desto grüner.**
- **Durchgestrichene Tonne = nicht in den Hausmüll; vor der Abgabe Daten löschen.**
- **DSGVO-Grundsätze: Recht, Zweck, Minimum, Richtig, Begrenzt, Sicher, Nachweis.**
- **Auskunft binnen 1 Monat – Panne binnen 72 Stunden – Bußgeld bis 20 Mio. oder 4 %.**
- **Zutritt = Raum, Zugang = System, Zugriff = Daten.**

## Prüfungsfalle
- **Zutritts-, Zugangs- und Zugriffskontrolle** werden gern verwechselt: Raum – System – Daten.
- Die **72-Stunden-Frist** gilt für die Meldung an die **Aufsichtsbehörde**, nicht für die Antwort auf Auskunftsanträge (dort: 1 Monat).
- Auch **IP-Adressen** und **Personalnummern** sind personenbezogene Daten.
- **Anonymisierte** Daten fallen nicht mehr unter die DSGVO, **pseudonymisierte** schon.
- Ein **Datenschutzbeauftragter** ist ab 20 ständig mit automatisierter Verarbeitung Beschäftigten Pflicht – nicht ab 20 Mitarbeitenden insgesamt.
- Eine **Einwilligung** ist nur wirksam, wenn sie **freiwillig** ist; im Arbeitsverhältnis ist das wegen der Abhängigkeit besonders zu prüfen.
- **Löschen in den Papierkorb** oder **Schnellformatierung** ist keine sichere Datenlöschung.
- Ökologische Maßnahmen können ökonomisch sinnvoll sein (Energiekosten) – Nachhaltigkeit bedeutet nicht automatisch Verlust.

## Grafik
### Datenpanne nach DSGVO
1. Mitarbeiter: Notebook mit unverschlüsselten Kundendaten wird im Zug gestohlen
2. Mitarbeiter -> IT-Leitung: meldet den Verlust sofort intern
3. IT-Leitung -> Datenschutzbeauftragter: Bewertung des Risikos für die Betroffenen
4. Verantwortlicher -> Aufsichtsbehörde: Meldung binnen 72 Stunden (Art. 33)
5. Verantwortlicher -> Kunden: Benachrichtigung bei hohem Risiko (Art. 34)
6. IT-Leitung: Maßnahme – BitLocker-Verschlüsselung für alle Notebooks

### Lebensweg eines Firmen-Notebooks
1. Einkauf: Gerät mit Umweltzeichen und Reparierbarkeit auswählen
2. Betrieb: Energiesparmodus, lange Nutzungsdauer, Akkutausch statt Neukauf
3. Aussonderung: Daten nach Standard sicher löschen oder Datenträger nach DIN 66399 vernichten
4. Einkauf -> Entsorger: Weitergabe zur Wiederverwendung oder an zertifizierten Entsorger
5. Entsorger: Recycling von Metallen und fachgerechte Beseitigung von Schadstoffen

## Lab
### PowerShell
Verschlüsselungsstatus prüfen (TOM: Vertraulichkeit). Maschine: Firmen-Notebook CL01 (Windows 11 Pro, Domäne exa.local) – PowerShell als Administrator.
1. Status aller Laufwerke anzeigen: `Get-BitLockerVolume | Select-Object MountPoint, VolumeStatus, ProtectionStatus, EncryptionMethod`
2. Alternativ in der Eingabeaufforderung: `manage-bde -status C:`
3. Prüfen, ob `ProtectionStatus` den Wert `On` hat und die Methode `XtsAes128` oder `XtsAes256` lautet.
4. Ergebnis im Verzeichnis der TOM bzw. im Asset-Management dokumentieren.

### GUI
1. Auf CL01 Einstellungen → Datenschutz und Sicherheit → Geräteverschlüsselung bzw. Systemsteuerung → BitLocker-Laufwerkverschlüsselung öffnen.
2. Status „BitLocker aktiviert“ für Laufwerk C: prüfen.
3. Speicherort des Wiederherstellungsschlüssels prüfen (z. B. Active Directory bzw. Entra ID), nicht auf dem Gerät selbst.

## Legende
### Personenbezogene Daten
- Was: Alle Informationen über eine identifizierte oder identifizierbare natürliche Person (Art. 4 DSGVO).
- Beispiel: Name, E-Mail-Adresse, IP-Adresse, Personalnummer, Standortdaten, Fotos.
- Warum: Nur für sie gilt die DSGVO; anonymisierte Daten fallen heraus.
### Technische und organisatorische Maßnahmen (TOM)
- Was: Schutzmaßnahmen, die die Sicherheit der Verarbeitung gewährleisten (Art. 32 DSGVO).
- Wie: Technisch (Verschlüsselung, MFA, Backup, Firewall) und organisatorisch (Richtlinien, Schulungen, Berechtigungskonzept, Besucherregelung).
- Wann: Vor Beginn der Verarbeitung festlegen und regelmäßig überprüfen.
- Wer: Der Verantwortliche (Unternehmen), unterstützt von IT und Datenschutzbeauftragtem.
### Green IT
- Was: Umwelt- und ressourcenschonender Einsatz von Informationstechnik über den gesamten Lebenszyklus.
- Wie: Effiziente Hardware, Virtualisierung, Power-Management, lange Nutzung, fachgerechtes Recycling.
- Warum: Senkt Energieverbrauch, CO₂-Emissionen und Kosten.
### Elektroaltgeräte
- Was: Ausgediente elektrische und elektronische Geräte nach ElektroG.
- Wo: Wertstoffhof, Rücknahmestellen des Handels, zertifizierte Entsorger (B2B).
- Wie: Getrennt vom Hausmüll, Batterien entnehmen, Daten vorher sicher löschen.

## Karteikarten
- F: Nennen Sie die drei Säulen der Nachhaltigkeit. | A: Ökologie, Ökonomie, Soziales.
- F: Wie wird die PUE berechnet? | A: Gesamtenergiebedarf des Rechenzentrums geteilt durch den Energiebedarf der IT-Geräte; Idealwert 1,0.
- F: Nennen Sie drei Green-IT-Maßnahmen. | A: Virtualisierung/Serverkonsolidierung, Power-Management, energieeffiziente Hardware mit Umweltzeichen, längere Nutzungsdauer, Thin Clients, effiziente Kühlung.
- F: Was bedeutet die durchgestrichene Mülltonne auf einem Gerät? | A: Das Gerät darf nicht über den Hausmüll entsorgt werden (ElektroG).
- F: Wie lautet die Abfallhierarchie nach § 6 KrWG? | A: Vermeidung, Vorbereitung zur Wiederverwendung, Recycling, sonstige Verwertung, Beseitigung.
- F: Nennen Sie vier Grundsätze der DSGVO. | A: Rechtmäßigkeit/Transparenz, Zweckbindung, Datenminimierung, Richtigkeit, Speicherbegrenzung, Integrität und Vertraulichkeit, Rechenschaftspflicht.
- F: Innerhalb welcher Frist muss eine Datenpanne der Aufsichtsbehörde gemeldet werden? | A: Unverzüglich, möglichst binnen 72 Stunden nach Bekanntwerden (Art. 33 DSGVO).
- F: Innerhalb welcher Frist muss ein Auskunftsersuchen beantwortet werden? | A: Unverzüglich, spätestens innerhalb eines Monats (Art. 12 Abs. 3 DSGVO).
- F: Wann muss ein Datenschutzbeauftragter benannt werden? | A: Wenn in der Regel mindestens 20 Personen ständig mit der automatisierten Verarbeitung personenbezogener Daten beschäftigt sind (§ 38 BDSG) oder bei risikoreicher Kerntätigkeit.
- F: Was ist der Unterschied zwischen Zugangs- und Zugriffskontrolle? | A: Zugangskontrolle verhindert die Nutzung von Systemen durch Unbefugte; Zugriffskontrolle regelt, welche Daten Berechtigte sehen oder ändern dürfen.
- F: Wie hoch kann ein Bußgeld nach DSGVO maximal sein? | A: Bis 20 Mio. € oder 4 % des weltweiten Jahresumsatzes, je nachdem, welcher Betrag höher ist.
- F: Welche Norm regelt die Vernichtung von Datenträgern? | A: DIN 66399 (Schutzklassen und Sicherheitsstufen).

## Lücken
- Die drei Säulen der Nachhaltigkeit sind Ökologie, {Ökonomie} und {Soziales}.
- Eine PUE von {1,0|1} wäre der theoretische Idealwert eines Rechenzentrums.
- Nach dem Grundsatz der {Datenminimierung} dürfen nur so viele Daten erhoben werden, wie für den Zweck nötig sind.
- Eine Datenpanne ist der Aufsichtsbehörde binnen {72|zweiundsiebzig} Stunden zu melden.
- Die {Zutrittskontrolle} verhindert, dass Unbefugte Räume mit Datenverarbeitungsanlagen betreten.
- Elektroaltgeräte sind mit dem Symbol der durchgestrichenen {Mülltonne|Abfalltonne} gekennzeichnet.

## Zuordnen
### TOM-Kontrollziel und Maßnahme
- Zutrittskontrolle => Chipkartenleser am Serverraum
- Zugangskontrolle => Mehrfaktor-Authentifizierung bei der Anmeldung
- Zugriffskontrolle => Berechtigungskonzept mit NTFS-Gruppen
- Weitergabekontrolle => VPN-Tunnel für Homeoffice-Verbindungen
- Verfügbarkeitskontrolle => Tägliches Backup nach der 3-2-1-Regel
- Eingabekontrolle => Protokollierung von Änderungen in der Kundendatenbank

### Betroffenenrecht und Artikel
- Auskunftsrecht => Art. 15 DSGVO
- Recht auf Berichtigung => Art. 16 DSGVO
- Recht auf Löschung => Art. 17 DSGVO
- Recht auf Datenübertragbarkeit => Art. 20 DSGVO
- Widerspruchsrecht => Art. 21 DSGVO

### Nachhaltigkeitssäule und Maßnahme
- Ökologie => Abwärme des Rechenzentrums heizt das Bürogebäude
- Ökonomie => Senkung der Stromkosten durch Serverkonsolidierung
- Soziales => Höhenverstellbare Schreibtische und Weiterbildungsangebote

## Reihenfolge
### Abfallhierarchie nach KrWG (höchste Priorität zuerst)
1. Vermeidung
2. Vorbereitung zur Wiederverwendung
3. Recycling
4. Sonstige Verwertung (z. B. energetisch)
5. Beseitigung

### Bearbeitung eines Auskunftsersuchens nach Art. 15
1. Antrag entgegennehmen und Eingang dokumentieren
2. Identität der anfragenden Person prüfen
3. Daten in allen Systemen ermitteln
4. Auskunft mit Zwecken, Empfängern, Speicherdauer und Kopie zusammenstellen
5. Auskunft innerhalb eines Monats sicher übermitteln

## Freitext
- F: Nennen und erläutern Sie vier Grundsätze für die Verarbeitung personenbezogener Daten nach Art. 5 DSGVO. | M: Rechtmäßigkeit/Transparenz (Rechtsgrundlage, Betroffene informieren), Zweckbindung (nur für festgelegte Zwecke), Datenminimierung (nur notwendige Daten), Richtigkeit (aktuell halten), Speicherbegrenzung (löschen, wenn nicht mehr nötig), Integrität und Vertraulichkeit (Schutz durch TOM), Rechenschaftspflicht (Einhaltung nachweisen). | P: 8
- F: Ein Rechenzentrum verbraucht im Jahr 1.500 MWh, davon entfallen 1.000 MWh auf die IT-Geräte. Berechnen Sie die PUE und beurteilen Sie das Ergebnis. | M: PUE = 1.500 ÷ 1.000 = 1,5. 50 % zusätzliche Energie für Kühlung, USV, Beleuchtung; mittelmäßig – moderne Rechenzentren erreichen Werte um 1,2 oder besser. | P: 3
- F: Beschreiben Sie, wie die Netzilon GmbH 50 ausgemusterte Notebooks datenschutzkonform und umweltgerecht entsorgt. | M: Inventarisieren, Daten sicher löschen (zertifizierte Löschsoftware, Secure Erase) oder SSDs nach DIN 66399 vernichten lassen, Löschprotokoll erstellen; Wiederverwendung prüfen (Spende, Refurbisher); sonst Übergabe an zertifizierten Entsorger nach ElektroG, Akkus getrennt; Entsorgungsnachweis aufbewahren. | P: 5

## Szenario
### Auskunftsersuchen eines Kunden
Ein ehemaliger Kunde schreibt der Netzilon GmbH per E-Mail: „Ich möchte wissen, welche Daten Sie über mich gespeichert haben, und verlange anschließend die Löschung.“ Azubi Hannah soll den Vorgang vorbereiten.
- F: Auf welches Recht beruft sich der Kunde zuerst? | A: Auf das Auskunftsrecht nach Art. 15 DSGVO.
- F: Bis wann muss die Netzilon GmbH antworten? | A: Unverzüglich, spätestens innerhalb eines Monats nach Eingang (Art. 12 Abs. 3), in komplexen Fällen verlängerbar um zwei Monate mit Begründung.
- F: Muss die Netzilon GmbH alle Daten sofort löschen? | A: Nur, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen – z. B. Rechnungen nach HGB/AO; diese Daten werden gesperrt (Einschränkung) und nach Fristablauf gelöscht.
- F: Was muss Hannah vor der Auskunft prüfen? | A: Die Identität des Anfragenden, damit keine Daten an Unbefugte gehen.

### Green-IT-Projekt im Serverraum
Die Netzilon GmbH betreibt 12 physische Server mit durchschnittlich 10 % Auslastung. Die Geschäftsführung möchte Energiekosten senken und das Unternehmen nachhaltiger aufstellen.
- F: Welche Maßnahme bietet sich zuerst an? | A: Virtualisierung und Konsolidierung der Server auf wenige leistungsfähige Hosts.
- F: Welche Säulen der Nachhaltigkeit werden dadurch angesprochen? | A: Ökologie (weniger Energie, weniger Hardware) und Ökonomie (geringere Strom-, Kühl- und Wartungskosten).
- F: Was ist mit den nicht mehr benötigten Servern zu tun? | A: Daten sicher löschen bzw. Datenträger vernichten, Wiederverwendung prüfen, sonst über zertifizierten Entsorger nach ElektroG entsorgen.
- F: Welcher Effekt könnte die Einsparung schmälern? | A: Der Rebound-Effekt – frei werdende Kapazität verleitet zu zusätzlichen VMs und Diensten.

## Spickzettel
- Nachhaltigkeit: Ökologie – Ökonomie – Soziales (Brundtland 1987, SDGs)
- Green IT: Virtualisierung, Power-Management, Labels (Blauer Engel, TCO, Energy Star), lange Nutzung
- PUE = Gesamt ÷ IT, ideal 1,0
- KrWG: Vermeiden > Wiederverwenden > Recyceln > Verwerten > Beseitigen
- ElektroG: Tonne durchgestrichen, Handel ≥ 400 m² nimmt zurück, Daten vorher löschen, DIN 66399
- DSGVO Art. 5: 7 Grundsätze; Art. 6: Rechtsgrundlagen
- Rechte Art. 15–22; Antwort 1 Monat; Panne 72 h (Art. 33)
- TOM: Zutritt (Raum), Zugang (System), Zugriff (Daten), Weitergabe, Eingabe, Auftrag, Verfügbarkeit, Trennung

## Quiz
? Welche drei Dimensionen umfasst das Drei-Säulen-Modell der Nachhaltigkeit?
* Ökologie, Ökonomie, Soziales
- Technik, Organisation, Personal
- Umwelt, Politik, Recht
- Qualität, Kosten, Zeit
! Die Säulen sollen im Gleichgewicht stehen.

? Ein Rechenzentrum benötigt insgesamt 2.400 MWh, die IT-Geräte 2.000 MWh. Wie hoch ist die PUE?
* 1,2
- 0,83
- 1,5
- 4,4
! PUE = 2.400 ÷ 2.000 = 1,2.

? Welche Maßnahmen gehören zu Green IT? (3 richtige)
* Serverkonsolidierung durch Virtualisierung
* Beschaffung von Geräten mit Umweltzeichen wie dem Blauen Engel
* Verlängerung der Nutzungsdauer von Notebooks
- Jährlicher Austausch aller Geräte gegen das neueste Modell
- Dauerbetrieb aller Arbeitsplatzrechner rund um die Uhr
- Entsorgung von Altgeräten im Restmüll
! Die längste Nutzung spart oft die meisten Emissionen, weil die Herstellung den größten Anteil hat.

? Welche Stufe hat nach der Abfallhierarchie des KrWG die höchste Priorität?
* Vermeidung
- Recycling
- Energetische Verwertung
- Beseitigung
! § 6 KrWG.

? Was bedeutet das Symbol der durchgestrichenen Mülltonne auf einem Gerät?
* Das Gerät darf nicht im Hausmüll entsorgt werden.
- Das Gerät ist vollständig recycelbar.
- Das Gerät enthält keine Schadstoffe.
- Das Gerät darf nur vom Hersteller repariert werden.
! Kennzeichnung nach ElektroG.

? Welcher DSGVO-Grundsatz verlangt, dass nur so viele Daten erhoben werden, wie für den Zweck erforderlich sind?
* Datenminimierung
- Zweckbindung
- Speicherbegrenzung
- Rechenschaftspflicht
! Art. 5 Abs. 1 lit. c DSGVO.

? Innerhalb welcher Frist ist eine meldepflichtige Datenschutzverletzung der Aufsichtsbehörde zu melden?
* Möglichst binnen 72 Stunden nach Bekanntwerden
- Innerhalb eines Monats
- Innerhalb von 14 Tagen
- Erst nach Abschluss der internen Untersuchung
! Art. 33 DSGVO; bei hohem Risiko zusätzlich Benachrichtigung der Betroffenen (Art. 34).

? Welche Daten sind personenbezogen im Sinne der DSGVO? (2 richtige)
* Die IP-Adresse eines Kunden
* Die Personalnummer eines Mitarbeiters
- Der durchschnittliche Stromverbrauch des Serverraums
- Die vollständig anonymisierte Statistik über Ticketanzahlen
- Die Modellbezeichnung eines Switches
! Personenbezug liegt vor, wenn eine natürliche Person identifiziert oder identifizierbar ist.

? Welche TOM-Kategorie wird durch ein Schloss mit Chipkartenleser am Serverraum umgesetzt?
* Zutrittskontrolle
- Zugangskontrolle
- Zugriffskontrolle
- Eingabekontrolle
! Zutritt = physischer Raum.

? Welche Maßnahme ist ein Beispiel für Zugriffskontrolle?
* Ein Berechtigungskonzept für Lese- und Schreibrechte nach Rollen
- Ein abgeschlossener Serverraum mit Chipkartenleser an der Tür
- Eine USV, die den Server bei Stromausfall weiter versorgt
- Ein Besucherbuch mit Begleitpflicht am Empfang
! Zugriffskontrolle betrifft die Rechte auf Daten innerhalb der Systeme; der abgeschlossene Raum ist Zutrittskontrolle.

? Ab wann muss ein Unternehmen nach BDSG in der Regel einen Datenschutzbeauftragten benennen?
* Ab 20 Personen, die ständig personenbezogene Daten automatisiert verarbeiten
- Ab 10 Mitarbeitern insgesamt, unabhängig von ihrer Tätigkeit
- Erst ab 250 Mitarbeitern, darunter gilt eine Ausnahme für KMU
- Nur bei börsennotierten Unternehmen und Behörden
! § 38 Abs. 1 BDSG; unabhängig davon bei risikoreicher Kerntätigkeit (Art. 37 DSGVO).

? Wie hoch kann ein Bußgeld bei schweren DSGVO-Verstößen höchstens sein?
* 20 Mio. € oder 4 % des weltweiten Jahresumsatzes (höherer Wert)
- 50.000 € je Verstoß, unabhängig von der Unternehmensgröße
- 1 Mio. € oder 1 % des Jahresumsatzes, je nachdem, was niedriger ist
- 10 % des Jahresgewinns des Vorjahres
! Art. 83 Abs. 5 DSGVO.

? Auf welcher Rechtsgrundlage verarbeitet ein Arbeitgeber die Steuer-ID eines Mitarbeiters für die Lohnabrechnung?
* Erfüllung einer rechtlichen Verpflichtung
- Einwilligung des Mitarbeiters
- Berechtigtes Interesse an Werbung
- Lebenswichtiges Interesse
! Art. 6 Abs. 1 lit. c DSGVO – steuerrechtliche Pflichten.
