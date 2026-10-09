---
id: office-it-betrieb
bereich: AP1
block: OF
kapitel: Office (Tabellenkalkulation & Textverarbeitung)
titel: Office im IT-Betrieb – Microsoft 365 vs. LTSC, Lizenzen, Dateiformate, Makrosicherheit, Barrierefreiheit, Präsentation
stufe: Fortgeschritten
fach: Office (EF)
pruefungen: [AP1, Schule]
quellen: [Microsoft-Support – Excel/Word]
verweise: [office-word, office-excel-datenanalyse, ihk-dokumentation-praesentation]
---

## Profi

### Microsoft 365 Apps vs. Office LTSC
| Merkmal | **Microsoft 365 Apps** (Abo) | **Office LTSC 2024** (Long Term Servicing Channel, Volumenlizenz) / Office 2024 (Kauf) |
|---|---|---|
| Lizenz | **Abonnement** pro Benutzer, monatlich/jährlich | **Dauerlizenz** (perpetual), einmalig |
| Funktionen | laufend neue Features (z. B. XVERWEIS, dynamische Arrays, Copilot-Integration je nach Plan) | eingefrorener Funktionsstand, nur Sicherheitsupdates |
| Installation | bis zu **5 PCs/Macs + 5 Tablets + 5 Smartphones** pro Benutzer (Business/Enterprise-Pläne) | an das Gerät gebunden (LTSC: Volumenaktivierung per KMS/MAK) |
| Cloud | OneDrive, Teams, Exchange Online, SharePoint je nach Plan | keine Clouddienste inklusive |
| Updatekanäle | Aktueller Kanal, Monatlicher Enterprise-Kanal, Halbjährlicher Enterprise-Kanal | kein Featurekanal |
| Einsatz | Standard in Büros mit Internet, Zusammenarbeit | abgeschottete/regulierte Systeme (Produktion, Labor, ohne Internet) |
| Support | solange das Abo läuft | fester Lebenszyklus (~5 Jahre) |

Bereitstellung im Unternehmen: **Office-Bereitstellungstool** (*Office Deployment Tool*, ODT) mit `configuration.xml`, **Microsoft Intune**, **Configuration Manager**. Lizenzen werden im **Microsoft 365 Admin Center** Benutzern zugewiesen; Aktivierung über das Entra-ID-Konto. Mehrbenutzer-Terminalserver brauchen **Shared Computer Activation** (Enterprise-/Business-Premium-Pläne).

### Lizenzierung – Grundbegriffe
- **Benutzerlizenz** (pro Person, mehrere Geräte) vs. **Gerätelizenz** (pro Rechner).
- **OEM** (an Gerät gebunden), **Retail/FPP** (Einzelhandel, übertragbar), **Volumenlizenz** (Unternehmen, z. B. über Rahmenvertrag), **Abonnement** (CSP-Partner, direkt).
- Unterlizenzierung ist eine **Urheberrechtsverletzung** – Lizenzmanagement (Software Asset Management) dokumentiert Bestand und Zuweisung.

### Dateiformate
| Endung | Bedeutung |
|---|---|
| **.xlsx / .docx / .pptx** | Office Open XML (ZIP-Container mit XML), **ohne Makros** – Standard |
| **.xlsm / .docm / .pptm** | makrofähig (VBA) |
| **.xltx / .dotx / .potx** | Vorlagen (mit **m** am Ende makrofähig) |
| **.xls / .doc / .ppt** | Binärformate bis Office 2003 (Kompatibilitätsmodus) |
| **.xlsb** | Excel-Binärarbeitsmappe, schnell bei großen Daten, kann Makros enthalten |
| **.csv** | Text, kommagetrennt (deutsch meist **Semikolon**) – nur Werte, keine Formeln/Formate, ein Blatt |
| **.pdf** | plattformunabhängiges Ausgabeformat, Layout fest; **PDF/A** für Langzeitarchivierung; PDF/UA für Barrierefreiheit |
| **.odt / .ods** | OpenDocument (LibreOffice), offener ISO-Standard |

### Makrosicherheit
Makros (VBA) können Schadcode ausführen (Ransomware-Einfallstor über E-Mail-Anhänge). Seit 2022 **blockiert Office Makros in Dateien aus dem Internet** standardmäßig (**Mark of the Web**, Zone.Identifier) – die Leiste „Sicherheitsrisiko“ lässt sich nicht einfach wegklicken. Einstellungen im **Trust Center** (Datei → Optionen → Trust Center → Einstellungen für das Trust Center → Makroeinstellungen): *Alle Makros ohne Benachrichtigung deaktivieren*, *mit Benachrichtigung deaktivieren*, *alle außer digital signierten deaktivieren*, *alle aktivieren* (nicht empfohlen). Unternehmensweit per **Gruppenrichtlinie/Intune**; **Vertrauenswürdige Speicherorte** sparsam, **digital signierte Makros** von vertrauenswürdigen Herausgebern, **Geschützte Ansicht** für Downloads und Anhänge, **Attack Surface Reduction-Regeln** in Defender.

### Barrierefreiheit
Überprüfen → **Barrierefreiheit überprüfen** (*Accessibility Checker*). Regeln: **Alternativtext** für Bilder/Diagramme, echte **Überschriften-Formatvorlagen**, **Tabellen mit Kopfzeile**, keine verbundenen Zellen, ausreichender **Farbkontrast**, Information nicht nur über Farbe, aussagekräftige **Linktexte**, sinnvolle **Lesereihenfolge** in Folien, beschreibende Blattnamen. Rechtsgrundlage: **Barrierefreiheitsstärkungsgesetz (BFSG)** seit 28.06.2025 für bestimmte Produkte/Dienstleistungen, **BITV 2.0** für öffentliche Stellen, Norm EN 301 549 / WCAG.

### PowerPoint – Grundregeln für Präsentationen (Projektpräsentation AP2)
- Ziel und Publikum klären; roter Faden: **Einleitung – Hauptteil – Schluss** (Ausgangslage, Ziel, Vorgehen, Ergebnis, Fazit/Ausblick).
- **Folienmaster** für einheitliches Design (Logo, Schrift, Farben, Foliennummer), **Layouts** statt frei platzierter Textfelder.
- **Wenig Text**: Stichpunkte statt Sätze (Richtwert ≤ 6 Punkte je Folie), große Schrift (≥ 18–24 pt), serifenlose Schrift, hoher Kontrast.
- **Visualisieren**: Diagramme, Netzpläne, Screenshots; eine Kernaussage pro Folie; Folientitel als Aussage.
- Animationen **sparsam** und zweckgebunden (schrittweiser Aufbau), keine Effekthascherei.
- **Referentenansicht** (Notizen, Timer, nächste Folie), Probevortrag mit Zeitmessung – in der AP2 ca. **15 Minuten Präsentation**, anschließend Fachgespräch.
- Quellen angeben, Bildrechte beachten, Rechtschreibung prüfen; Ausweichplan (PDF auf USB-Stick).

## Einfach
Office kann man auf zwei Arten bekommen: wie ein **Streaming-Abo** (Microsoft 365) – du zahlst jeden Monat, bekommst immer die neuesten Sachen und kannst es auf mehreren Geräten nutzen. Oder wie eine **gekaufte DVD** (Office LTSC/2024) – einmal bezahlt, gehört dir, aber neue Funktionen kommen nicht dazu.

Jede Datei hat eine **Endung**, wie ein Nachname: **.docx** ist ein Word-Text, **.xlsx** eine Excel-Tabelle. Hängt ein **m** dran (**.xlsm**), dürfen kleine **Programme (Makros)** drin sein. Die können nützlich sein – aber auch Viren verstecken. Deshalb sperrt Office Makros aus dem Internet erst mal. Ein **PDF** ist wie ein **Foto** deines Dokuments – sieht überall gleich aus.

**Barrierefreiheit** heißt: Auch Menschen, die nicht gut sehen, sollen dein Dokument nutzen können. Ein **Vorleseprogramm** kann Bilder nicht sehen – deshalb schreibst du einen **Alternativtext** dazu, z. B. „Säulendiagramm: Kosten je Abteilung“.

Eine gute **Präsentation** ist wie ein **Plakat**, nicht wie ein Buch: wenig Text, große Schrift, Bilder. Das Erzählen machst du – die Folien helfen nur.

## Merksatz
- **365 = Abo, immer aktuell, Cloud; LTSC = Kauf, eingefroren, offline-tauglich.**
- **x = ohne Makro, m = mit Makro, t = Vorlage.**
- **Makros aus dem Internet: blockiert – nur signiert und geprüft freigeben.**
- **Alternativtext, Überschriften, Kontrast – Barrierefreiheit prüfen.**
- **Folie = Plakat: eine Aussage, wenig Text, großer Kontrast.**

## Prüfungsfalle
- **.xlsx kann keine Makros speichern** – beim Speichern einer Mappe mit VBA warnt Excel; nötig ist .xlsm (oder .xlsb).
- **CSV** speichert nur das **aktive Blatt** und nur **Werte** – Formeln, Formate und weitere Blätter gehen verloren.
- Office LTSC erhält **keine neuen Funktionen** – XVERWEIS fehlt z. B. in Office 2016/2019.
- Microsoft 365 **ohne gültiges Abo** schaltet in einen eingeschränkten Modus (Anzeigen/Drucken), Dateien bleiben lesbar.
- „Alle Makros aktivieren“ ist **keine** zulässige Lösung für ein Fachproblem.
- Farbige Markierung allein (rot/grün) ist **nicht barrierefrei** – zusätzlich Text oder Symbol.
- Vollgeschriebene Folien vorlesen kostet in der AP2-Präsentation Punkte.

## Grafik
### Makro aus dem Internet – was Office prüft
1. E-Mail -> Benutzer: Anhang Rechnung.xlsm aus dem Internet
2. Windows: Datei erhält Mark of the Web (Zone.Identifier)
3. Benutzer -> Excel: Datei öffnen – Geschützte Ansicht
4. Excel: Trust Center prüft Signatur und vertrauenswürdigen Speicherort
5. Excel -> Benutzer: Leiste „Sicherheitsrisiko – Makros blockiert“
6. IT-Abteilung: Freigabe nur für signierte Makros per Gruppenrichtlinie/Intune

## Lab
**Maschine**: CL01.example.com (Windows 11, Word/Excel/PowerPoint aus Microsoft 365 Apps for Business, angemeldet als Benutzer aus example.com).

### GUI
1. **CL01**: Excel → Datei → **Konto** → Produktinformationen ablesen (Abo-Produkt, Version, Updatekanal) → **Updateoptionen → Jetzt aktualisieren**.
2. Excel → Datei → Optionen → **Trust Center** → Einstellungen für das Trust Center → **Makroeinstellungen** ansehen (Standard: mit Benachrichtigung deaktivieren); **Vertrauenswürdige Speicherorte** und **Geschützte Ansicht** prüfen.
3. Eine Mappe als **.xlsx**, **.xlsm**, **.csv (Trennzeichen-getrennt)** und **.pdf** speichern (Datei → Speichern unter → Dateityp) → Dateigrößen und Inhalte vergleichen; CSV mit dem Editor öffnen.
4. Heruntergeladene Datei: Rechtsklick → Eigenschaften → Bereich **Sicherheit „Zulassen“** (Mark of the Web) – nur zur Demonstration ansehen, nicht leichtfertig entfernen.
5. Word → Dokument mit Bild → Überprüfen → **Barrierefreiheit überprüfen** → Alternativtext ergänzen, Tabellenkopfzeile setzen.
6. PowerPoint → Ansicht → **Folienmaster** → Logo, Schriftart und Foliennummer festlegen → zurück zur Normalansicht.
7. PowerPoint → Bildschirmpräsentation → **Referentenansicht verwenden** → Probelauf mit **Probelauf für Anzeigedauern**.
8. Datei → Exportieren → **PDF/XPS erstellen** → Optionen: **ISO 19005-1-kompatibel (PDF/A)** und „Dokumentstrukturtags für Barrierefreiheit“.

### Formeln
```text
Version prüfen:      Datei → Konto → Info zu Excel
Dateityp ändern:     F12 (Speichern unter) → Dateityp .xlsm
Barrierefreiheit:    Überprüfen → Barrierefreiheit überprüfen
Trust Center:        Datei → Optionen → Trust Center → Makroeinstellungen
ODT-Beispiel (Admin): setup.exe /configure configuration.xml  (Produkt O365BusinessRetail, Kanal MonthlyEnterprise)
```

## Legende
### Microsoft 365 Apps
- Was: Abonnementbasierte Office-Suite mit laufenden Funktionsupdates und Clouddiensten.
- Wer: Lizenz pro Benutzer, zugewiesen im Microsoft 365 Admin Center.
- Wann: Standardbüro mit Internet und Zusammenarbeit (Teams, OneDrive).
- Warum: Immer aktueller Stand, mehrere Geräte pro Benutzer.
### Office LTSC
- Was: Dauerlizenz-Version mit festem Funktionsstand (Long Term Servicing Channel).
- Wann: Für abgeschottete oder regulierte Systeme ohne Cloudanbindung.
### Makrosicherheit
- Was: Schutz vor schädlichem VBA-Code in Office-Dateien.
- Wie: Trust Center, Mark of the Web, Signaturen, Gruppenrichtlinien.
- Wo: Clients aller Benutzer, zentral über GPO/Intune gesteuert.
- Warum: Makro-Anhänge sind ein klassischer Infektionsweg für Schadsoftware.

## Karteikarten
- F: Hauptunterschied zwischen Microsoft 365 Apps und Office LTSC? | A: 365 ist ein Abo mit laufenden Funktionsupdates und Clouddiensten; LTSC ist eine Dauerlizenz mit eingefrorenem Funktionsstand.
- F: Auf wie vielen Geräten darf ein Benutzer Microsoft 365 Apps (Business/Enterprise) installieren? | A: Bis zu 5 PCs/Macs, 5 Tablets und 5 Smartphones.
- F: Welche Dateiendung braucht eine Excel-Mappe mit VBA-Makros? | A: .xlsm (oder .xlsb); .xlsx speichert keine Makros.
- F: Was geht beim Speichern als CSV verloren? | A: Formeln, Formatierungen, Diagramme und alle Blätter außer dem aktiven – nur Werte bleiben.
- F: Wofür steht PDF/A? | A: Für ein PDF-Format zur Langzeitarchivierung (eingebettete Schriften, keine externen Abhängigkeiten).
- F: Was ist Mark of the Web? | A: Eine Kennzeichnung (Zone.Identifier), dass eine Datei aus dem Internet stammt; Office blockiert darin Makros standardmäßig.
- F: Wo stellt man die Makrosicherheit in Office ein? | A: Datei → Optionen → Trust Center → Einstellungen für das Trust Center → Makroeinstellungen (zentral per GPO/Intune).
- F: Was ist die Geschützte Ansicht? | A: Ein schreibgeschützter Sandbox-Modus für Dateien aus unsicheren Quellen.
- F: Nennen Sie drei Maßnahmen für barrierefreie Office-Dokumente. | A: Alternativtext für Bilder, Überschriften-Formatvorlagen, Tabellen mit Kopfzeile, ausreichender Kontrast.
- F: Wofür dient der Folienmaster in PowerPoint? | A: Für ein einheitliches Design aller Folien (Schrift, Farben, Logo, Platzhalter) an zentraler Stelle.
- F: Was zeigt die Referentenansicht? | A: Notizen, nächste Folie und Timer nur für den Vortragenden.
- F: Wie lange dauert die Projektpräsentation in der AP2 (FISI) etwa? | A: Etwa 15 Minuten, danach folgt das Fachgespräch.
- F: Was ist eine OEM-Lizenz? | A: Eine an ein bestimmtes Gerät gebundene, meist vorinstallierte Lizenz.

## Lücken
- Eine Excel-Datei mit Makros wird im Format {.xlsm|xlsm} gespeichert.
- Office {LTSC} erhält nur Sicherheitsupdates, aber keine neuen Funktionen.
- Bilder benötigen für Screenreader einen {Alternativtext}.
- Einheitliches Foliendesign legt man im {Folienmaster} fest.

## Zuordnen
### Dateiendung und Bedeutung
- .docx => Word-Dokument ohne Makros
- .xlsm => Excel-Arbeitsmappe mit Makros
- .dotx => Word-Vorlage
- .csv => Textdatei mit getrennten Werten
- .pdf => festes Layout zur Weitergabe
- .xls => altes Excel-Binärformat (bis 2003)

## Reihenfolge
### Projektpräsentation vorbereiten
1. Ziel und Zielgruppe festlegen
2. Gliederung mit rotem Faden erstellen
3. Folienmaster mit Design einrichten
4. Folien mit Kernaussagen und Visualisierungen erstellen
5. Barrierefreiheit und Rechtschreibung prüfen
6. Probevortrag mit Zeitmessung halten
7. Präsentation zusätzlich als PDF sichern

## Freitext
- F: Die Geschäftsleitung fragt, ob für 40 Büroarbeitsplätze Microsoft 365 Apps oder Office LTSC 2024 sinnvoller ist. Vergleichen Sie beide Varianten anhand von drei Kriterien und geben Sie eine Empfehlung. | M: Kosten: Abo laufend vs. Einmalkauf. Funktionen: 365 laufende Neuerungen, LTSC eingefroren. Cloud/Zusammenarbeit: 365 mit OneDrive/Teams, LTSC ohne. Geräte: 365 pro Benutzer bis 5 Geräte, LTSC pro Gerät. Empfehlung für vernetzte Büroarbeitsplätze mit Zusammenarbeit: Microsoft 365; LTSC nur für abgeschottete Systeme. | P: 8

## Szenario
### Makro-Anhang bei der Netzilon GmbH
Die Netzilon GmbH betreut einen Kunden, bei dem eine Mitarbeiterin eine E-Mail mit dem Anhang `Rechnung_2026.xlsm` erhalten hat. Beim Öffnen erscheint die rote Leiste „Sicherheitsrisiko – Microsoft hat die Ausführung von Makros blockiert“. Sie bittet den Support, die Makros „einfach freizuschalten“.
- F: Warum blockiert Excel die Makros? | A: Die Datei stammt aus dem Internet (Mark of the Web); Office blockiert Makros aus solchen Dateien standardmäßig als Schutz vor Schadsoftware. | P: 2
- F: Wie reagieren Sie als Support? | A: Nicht freischalten; Absender über einen zweiten Kanal verifizieren, Datei ggf. in einer Sandbox prüfen, Vorfall an IT-Sicherheit melden, Mail löschen. | P: 3
- F: Welche dauerhafte Konfiguration empfehlen Sie für das Unternehmen? | A: Per GPO/Intune nur digital signierte Makros zulassen, Makros aus dem Internet blockieren, Geschützte Ansicht aktiv, ASR-Regeln, Schulung der Mitarbeitenden. | P: 3
- F: Interne Auswertungen sollen Makros behalten. In welchem Format speichern Sie sie? | A: Als .xlsm (bzw. .xlsb), signiert und auf einem vertrauenswürdigen Speicherort. | P: 2

## Quiz
? Welches Lizenzmodell hat Microsoft 365 Apps for Business?
* Abonnement pro Benutzer
- Dauerlizenz pro Gerät
- OEM-Lizenz
- Freeware
! Bezahlt wird monatlich oder jährlich je Benutzer.

? Welche Office-Variante erhält keine neuen Funktionen, nur Sicherheitsupdates?
* Office LTSC
- Microsoft 365 Apps im Aktuellen Kanal
- Microsoft 365 Apps im Monatlichen Enterprise-Kanal
- Office für das Web
! LTSC = Long Term Servicing Channel mit festem Funktionsstand.

? In welchem Format speichern Sie eine Excel-Mappe mit VBA-Code?
* .xlsm
- .xlsx
- .csv
- .xltx
! .xlsx und .xltx speichern keine Makros, CSV speichert nur Werte.

? Was geht beim Speichern einer Mappe mit drei Blättern als CSV verloren?
* Formeln, Formatierungen und die nicht aktiven Blätter
- Nur die Spaltenbreiten
- Nichts, CSV ist verlustfrei
- Nur die Diagramme, alle Formeln und Blätter bleiben als Text vollständig erhalten
! CSV ist reiner Text mit den Werten des aktiven Blatts.

? Wie behandelt Office standardmäßig Makros in Dateien aus dem Internet?
* Sie werden blockiert
- Sie werden automatisch ausgeführt
- Sie werden in .xlsx umgewandelt
- Sie werden an Microsoft gesendet
! Grundlage ist das Mark of the Web; Freigabe nur bewusst durch Administratoren.

? Welche Makroeinstellung ist in Unternehmen empfehlenswert?
* Alle Makros außer digital signierten deaktivieren
- Alle Makros aktivieren
- Makros nur für Benutzer mit lokalen Administratorrechten automatisch ausführen lassen
- Trust Center abschalten
! Signierte Makros vertrauenswürdiger Herausgeber bleiben nutzbar.

? Welches Format eignet sich für die Langzeitarchivierung von Dokumenten?
* PDF/A
- .docm
- .csv
- .tmp
! PDF/A bettet Schriften ein und verbietet externe Abhängigkeiten.

? Was ist für die Barrierefreiheit eines Diagramms in Word wichtig?
* Ein aussagekräftiger Alternativtext
- Eine 3D-Darstellung
- Möglichst viele Farben
- Eine verkleinerte Schrift
! Screenreader lesen den Alternativtext vor.

? Wo legt man Logo und Schriftart einheitlich für alle Folien fest?
* Im Folienmaster
- In der Referentenansicht
- In den Notizen
- In der Gliederungsansicht
! Änderungen im Master wirken auf alle Folien des Layouts.

? Welche Regel gilt für Folien einer Projektpräsentation?
* Wenig Text, eine Kernaussage pro Folie
- Möglichst vollständige Sätze zum Vorlesen
- Jede Folie mit eigener Animation
- Kleine Schrift, damit alles passt
! Folien unterstützen den Vortrag, sie ersetzen ihn nicht.

? Welches Werkzeug stellt Microsoft 365 Apps mit einer configuration.xml bereit?
* Office-Bereitstellungstool (ODT)
- Windows Update
- Datenträgerverwaltung
- Ereignisanzeige
! Das Office Deployment Tool steuert Produkt, Sprache und Updatekanal.
