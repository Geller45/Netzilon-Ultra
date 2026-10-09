---
id: erg-itil-support
bereich: AP2
block: ERG
kapitel: Ergänzungen 2.2
titel: IT-Service-Management und Qualität – ITIL-Prozesse, Service Desk, SLA, Eskalation und PDCA
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [ITIL 4 Foundation (AXELOS/PeopleCert), ISO/IEC 20000-1, DIN EN ISO 9001:2015, IHK-Prüfungsaufgaben Störungsmanagement]
verweise: [ap2-itil-monitoring, ap2-vertraege, server-pv-support-stoerungs-beschwerdemanagement, ihk-hf5-qualitaet-lernkarten, ihk-fehleranalyse, wiso-unternehmen-qualitaet-fuehrung, server-pv-werk-dienstvertrag-sla]
---

## Profi

### ITIL in Kürze
**ITIL** (IT Infrastructure Library) ist ein Leitfaden mit bewährten Praktiken für das **IT-Service-Management (ITSM)**. ITIL 4 beschreibt ein **Service Value System** mit **34 Praktiken**; für die AP sind vor allem diese wichtig:

| Praktik | Ziel | Beispiel |
|---|---|---|
| **Incident Management** (Störungsmanagement) | Normalen Servicebetrieb **so schnell wie möglich** wiederherstellen | Drucker druckt nicht → Workaround: anderer Drucker |
| **Problem Management** | **Ursachen** wiederkehrender Störungen finden und beseitigen | 20 Druckstörungen → defekter Treiber erkannt (Known Error) |
| **Change Enablement** (Change Management) | Änderungen **kontrolliert** und risikoarm umsetzen | Treiberupdate mit Test, Freigabe (CAB), Rückfallplan |
| **Service Request Management** | Standardanfragen abwickeln | neues Headset, Kennwortrücksetzung, Softwarebestellung |
| **Service Level Management** | Servicequalität vereinbaren und messen | SLA mit Reaktions- und Lösungszeiten |
| **Service Desk** | **Single Point of Contact (SPOC)** für Anwender | Hotline, Ticketportal, Chat |

**Unterschied Incident – Problem**: Ein **Incident** ist eine ungeplante Unterbrechung oder Qualitätsminderung eines Services; ein **Problem** ist die (meist unbekannte) **Ursache** eines oder mehrerer Incidents. Ein **Known Error** ist ein Problem mit bekannter Ursache und dokumentiertem Workaround.

### Ticket und Priorität
Jede Meldung wird als **Ticket** erfasst (Melder, Zeitpunkt, betroffener Service/CI, Beschreibung, Kategorie, Priorität, Status, Lösung). **Priorität = Auswirkung (Impact) × Dringlichkeit (Urgency)** – z. B. Ausfall des ERP-Systems für alle (hoher Impact, hohe Dringlichkeit) = Priorität 1.

**Eskalation**:
- **Funktional (horizontal)** – Weitergabe an ein Team mit mehr **Fachwissen** (1st Level → 2nd Level → 3rd Level/Hersteller).
- **Hierarchisch (vertikal)** – Einbeziehung höherer **Führungsebenen**, wenn SLA-Verletzung droht oder Entscheidungen/Ressourcen nötig sind.

### Service Level Agreement (SLA)
Ein **SLA** ist eine Vereinbarung zwischen IT-Dienstleister und Kunde über Leistungsumfang und **messbare Qualität**: Servicezeiten (z. B. Mo–Fr 7–18 Uhr), **Verfügbarkeit** (z. B. 99,5 %), **Reaktionszeit**, **Lösungszeit** je Priorität, Eskalationsweg, Berichte, Vertragsstrafen/Bonus-Malus. Interne Vereinbarungen heißen **OLA** (Operational Level Agreement), Verträge mit externen Lieferanten **UC** (Underpinning Contract). **KPIs**: Erstlösungsquote (First Call Resolution), mittlere Lösungszeit (MTTR), SLA-Erfüllungsgrad, Kundenzufriedenheit.

Verfügbarkeit = (vereinbarte Zeit − Ausfallzeit) ÷ vereinbarte Zeit × 100 %. 99,5 % bei 24/7 im Jahr (8.760 h) erlauben **43,8 h** Ausfall.

### Qualitätsmanagement
**ISO 9001** beschreibt Anforderungen an ein **Qualitätsmanagementsystem** (prozessorientiert, Kundenorientierung, kontinuierliche Verbesserung, risikobasiertes Denken, Zertifizierung durch Audits). Kern ist der **PDCA-Zyklus (Deming-Kreis)**: **Plan** (planen, Ziele), **Do** (umsetzen, testen), **Check** (prüfen, messen), **Act** (standardisieren bzw. nachsteuern). **ISO/IEC 20000** ist die Norm speziell für IT-Service-Management.

## Einfach
Stell dir die IT-Abteilung als **Autowerkstatt** vor. Der **Service Desk** ist die Annahme: Jeder, der ein Problem hat, kommt erst dorthin. Dort wird ein **Ticket** geschrieben – wie ein Auftragszettel.

Wenn dein Auto liegen bleibt, willst du schnell weiterfahren. Die Werkstatt gibt dir vielleicht einen **Ersatzwagen**. Das ist **Incident Management**: Schnell helfen, damit du weiterarbeiten kannst – auch wenn die Ursache noch nicht klar ist.

Wenn aber zehn Autos desselben Modells mit demselben Fehler kommen, setzt sich ein Experte hin und sucht die **eigentliche Ursache**. Das ist **Problem Management**. Vielleicht ist ein Bauteil fehlerhaft und muss bei allen getauscht werden.

Und wenn die Werkstatt etwas ändern will, zum Beispiel neue Software ins Auto spielen, macht sie das nicht einfach so, sondern plant, testet und lässt es sich genehmigen. Das ist **Change Management**.

Mit dem Kunden wird vorher festgelegt, **wie schnell** die Werkstatt reagieren muss: „Bei Totalausfall innerhalb von einer Stunde, bei Kleinigkeiten innerhalb von zwei Tagen.“ Das steht im **SLA**.

Damit die Werkstatt immer besser wird, dreht sie sich im **PDCA-Kreis**: Planen, Machen, Prüfen, Verbessern – und wieder von vorn.

## Merksatz
- **Incident = schnell wiederherstellen. Problem = Ursache finden.**
- **Priorität = Auswirkung × Dringlichkeit.**
- **Funktional = mehr Wissen, hierarchisch = mehr Befugnis.**
- **SLA mit Kunde, OLA intern, UC mit Lieferant.**
- **PDCA: Plan – Do – Check – Act.**

## Prüfungsfalle
- Ein Workaround **beendet den Incident**, aber **nicht das Problem**.
- **Eskalation** ist nicht „nach oben petzen“: Die funktionale Eskalation geht zu Experten, die hierarchische zur Führung.
- **Reaktionszeit ≠ Lösungszeit**: Reaktion = erste qualifizierte Rückmeldung, Lösung = Service wiederhergestellt.
- Eine **Kennwortrücksetzung** ist ein **Service Request**, keine Störung.
- Verfügbarkeitsangaben beziehen sich auf die **vereinbarte Servicezeit**, nicht zwingend auf 24/7.

## Grafik
### Störung vom Anruf bis zum Abschluss
1. Anwender -> Service Desk: Meldung „ERP nicht erreichbar“
2. Service Desk: Ticket anlegen, Priorität 1 (hoher Impact, hohe Dringlichkeit)
3. Service Desk -> 2nd Level: Funktionale Eskalation
4. 2nd Level: Workaround – Dienst neu gestartet
5. 2nd Level -> Anwender: Service wiederhergestellt, Bestätigung
6. 2nd Level -> Problem Management: Ursache untersuchen (dritte Störung diese Woche)
7. Problem Management -> Change Management: Speicher erweitern (Change-Antrag)

### PDCA-Zyklus
1. Plan: Ziel – Erstlösungsquote auf 70 % erhöhen
2. Do: Wissensdatenbank im Service Desk einführen
3. Check: Quote nach 3 Monaten messen – 68 %
4. Act: Artikel ergänzen, Schulung, neue Runde

## Lab
**Maschinen**: Ticketsystem auf **SRV-HELP** (z. B. Webanwendung im Heimlabor **example.com**) und Client **CL01**; alternativ Ticketsimulation in einer Tabelle.

### GUI
1. **CL01**: Im Ticketportal ein Ticket „Drucker 2. OG druckt nicht“ anlegen (Kategorie Hardware, Impact mittel, Dringlichkeit hoch).
2. **SRV-HELP**: Prioritätsmatrix prüfen → Priorität 2; Ticket an 2nd Level Arbeitsplatz zuweisen.
3. **SRV-HELP**: Workaround dokumentieren („anderen Drucker verwenden“), Status „gelöst“; Melder bestätigt → „geschlossen“.
4. **SRV-HELP**: Bericht „Tickets je Kategorie“ erstellen; Häufung → Problem-Ticket anlegen.

### PowerShell
```powershell
# CL01 – Verfügbarkeit und erlaubte Ausfallzeit berechnen
$stundenJahr = 365 * 24
foreach ($sla in 99.0, 99.5, 99.9, 99.99) {
    $ausfall = $stundenJahr * (100 - $sla) / 100
    '{0} % → {1:N1} h Ausfall pro Jahr' -f $sla, $ausfall
}
```

## Legende
### Incident vs. Problem
- Was: Incident = ungeplante Unterbrechung eines Services; Problem = Ursache eines oder mehrerer Incidents.
- Wie: Incident mit Workaround schnell beheben; Problem durch Ursachenanalyse dauerhaft lösen.
- Wann: Incident sofort bei Meldung; Problem bei wiederkehrenden oder schweren Störungen.
- Wo: Ticketsystem/ITSM-Tool, Known-Error-Datenbank.
- Warum: Trennung von schneller Hilfe und gründlicher Ursachenbeseitigung.

### SLA
- Was: Vereinbarung über Leistungsumfang und messbare Qualität eines IT-Services.
- Wie: Servicezeiten, Verfügbarkeit, Reaktions- und Lösungszeiten je Priorität, Berichte, Sanktionen festlegen.
- Wann: Vor Beginn der Leistungserbringung, regelmäßig überprüft.
- Wo: Zwischen IT-Dienstleister und Kunde (intern: OLA, extern zum Lieferanten: UC).
- Warum: Erwartungen werden messbar und überprüfbar.

## Karteikarten
- F: Was ist das Ziel des Incident Managements? | A: Den normalen Servicebetrieb so schnell wie möglich wiederherzustellen.
- F: Was ist das Ziel des Problem Managements? | A: Ursachen von Incidents zu finden und dauerhaft zu beseitigen bzw. Wiederholungen zu verhindern.
- F: Was ist ein Known Error? | A: Ein Problem mit bekannter Ursache und dokumentiertem Workaround.
- F: Wie wird die Priorität eines Tickets bestimmt? | A: Aus Auswirkung (Impact) und Dringlichkeit (Urgency).
- F: Unterschied funktionale und hierarchische Eskalation? | A: Funktional: an Stelle mit mehr Fachwissen (2nd/3rd Level). Hierarchisch: an höhere Führungsebene (Befugnis, Ressourcen).
- F: Was bedeutet SPOC? | A: Single Point of Contact – der Service Desk als zentrale Anlaufstelle.
- F: Unterschied SLA, OLA und UC? | A: SLA mit dem Kunden, OLA zwischen internen Teams, UC mit externen Lieferanten.
- F: Wie viele Stunden Ausfall erlaubt 99,9 % Verfügbarkeit bei 24/7 im Jahr? | A: 8,76 Stunden.
- F: Wofür steht PDCA? | A: Plan, Do, Check, Act – kontinuierlicher Verbesserungsprozess (Deming-Kreis).
- F: Was regelt ISO 9001? | A: Anforderungen an ein Qualitätsmanagementsystem; zertifizierbar.

## Quiz
? Ein Benutzer kann nicht drucken; der Service Desk lässt ihn über einen anderen Drucker drucken. Welche Praktik ist das?
* Incident Management (Workaround)
- Problem Management
- Change Enablement
- Release Management
! Der Service ist wiederhergestellt; die Ursache ist noch offen.

? Was ist eine funktionale Eskalation?
* Weitergabe an eine Stelle mit mehr Fachwissen
- Weitergabe an die Geschäftsführung
- Schließen des Tickets
- Information des Kunden über die Rechnung
! Z. B. vom 1st Level an den 2nd Level Support.

? Wie wird die Priorität eines Incidents typischerweise ermittelt?
* Aus Auswirkung und Dringlichkeit
- Nur nach Uhrzeit der Meldung
- Nach der Hierarchiestufe des Melders
- Nach der Anzahl der Wörter im Ticket
! Prioritätsmatrix Impact × Urgency.

? Wie lange darf ein 24/7-Service mit 99,5 % Verfügbarkeit im Jahr ausfallen?
* 43,8 Stunden
- 4,38 Stunden
- 8,76 Stunden
- 87,6 Stunden
! 8.760 h × 0,5 % = 43,8 h.

? Wie heißt eine interne Vereinbarung zwischen zwei IT-Teams?
* OLA
- SLA
- UC
- NDA
! Operational Level Agreement.

? Welche Phase folgt im PDCA-Zyklus auf „Check“?
* Act
- Plan
- Do
- Close
! Act: Ergebnis standardisieren oder Maßnahmen nachsteuern, dann neuer Zyklus.

? Was ist eine Kennwortrücksetzung nach ITIL typischerweise?
* Ein Service Request
- Ein Problem
- Ein Major Incident
- Ein Change mit CAB-Freigabe
! Standardanfragen werden über Service Request Management abgewickelt.

? Welche Kennzahl misst, wie viele Anfragen beim ersten Kontakt gelöst werden?
* First Call Resolution (Erstlösungsquote)
- MTBF
- RPO
- TCO
! Wichtiger KPI für den Service Desk.

? Was beschreibt der Begriff Known Error?
* Ein Problem mit bekannter Ursache und dokumentiertem Workaround
- Ein Fehler, den der Benutzer selbst verursacht hat
- Ein geplanter Change
- Eine SLA-Verletzung
! Known Errors werden in einer Known-Error-Datenbank gepflegt.

## Lücken
- Ziel des {Incident} Managements ist die schnellstmögliche Wiederherstellung des Services.
- Die Ursache eines oder mehrerer Incidents heißt {Problem}.
- Der Service Desk ist der {Single Point of Contact|SPOC} für Anwender.
- Die Priorität ergibt sich aus Auswirkung und {Dringlichkeit}.
- Der Deming-Kreis heißt {PDCA}-Zyklus.

## Zuordnen
### ITIL-Praktik und Beispiel
- Incident Management => Workaround für ausgefallenen Drucker
- Problem Management => Ursache wiederkehrender Abstürze finden
- Change Enablement => Firmware-Update geplant, getestet, freigegeben
- Service Request Management => neues Headset bestellen

### Vereinbarung und Partner
- SLA => IT-Dienstleister und Kunde
- OLA => interne IT-Teams untereinander
- UC => IT-Dienstleister und externer Lieferant

### Kennzahl und Bedeutung
- First Call Resolution => Lösung beim ersten Kontakt
- MTTR => mittlere Zeit bis zur Wiederherstellung
- Verfügbarkeit => Anteil der vereinbarten Zeit ohne Ausfall
- SLA-Erfüllungsgrad => Anteil der Tickets innerhalb der vereinbarten Zeit

## Reihenfolge
### Incident-Bearbeitung
1. Störung erfassen (Ticket)
2. Kategorisieren und priorisieren
3. Erstdiagnose im 1st Level
4. Bei Bedarf funktional eskalieren
5. Lösen bzw. Workaround umsetzen
6. Mit dem Anwender prüfen und Ticket schließen

### PDCA-Zyklus
1. Plan
2. Do
3. Check
4. Act

### Change umsetzen
1. Change-Antrag (RFC) stellen
2. Risiko und Auswirkung bewerten
3. Freigabe (z. B. CAB)
4. In Testumgebung erproben
5. Umsetzung im Wartungsfenster mit Rückfallplan
6. Review und Dokumentation

## Freitext
- F: Erläutern Sie den Unterschied zwischen Incident Management und Problem Management an einem Beispiel. | M: Incident: schnelle Wiederherstellung, z. B. Neustart eines abgestürzten Dienstes. Problem: Ursachenanalyse bei wiederholten Abstürzen, z. B. Speicherleck erkannt und per Update (Change) beseitigt. | P: 4
- F: Nennen Sie fünf Inhalte eines SLA. | M: Leistungsbeschreibung, Servicezeiten, Verfügbarkeit, Reaktions- und Lösungszeiten je Priorität, Eskalationswege, Ansprechpartner, Berichtswesen/KPIs, Vertragsstrafen, Laufzeit/Kündigung. | P: 5
- F: Berechnen Sie die erlaubte monatliche Ausfallzeit für einen Service mit 99,5 % Verfügbarkeit bei einer Servicezeit von Mo–Fr 8–18 Uhr und 21 Arbeitstagen. | M: 21 × 10 h = 210 h; 0,5 % von 210 h = 1,05 h ≈ 63 Minuten. | P: 3

## Szenario
### E-Mail-Störung am Montagmorgen
Um 8:05 Uhr melden 30 Mitarbeiter, dass Outlook keine Verbindung herstellt. Das SLA sieht für Priorität 1 eine Reaktionszeit von 15 Minuten und eine Lösungszeit von 4 Stunden vor.
- F: Wie priorisieren Sie und warum? | A: Priorität 1 – hohe Auswirkung (viele Benutzer, Kernservice) und hohe Dringlichkeit. | P: 2
- F: Welche Schritte folgen? | A: Ticket/Major-Incident anlegen, Anwender informieren (Statusmeldung), funktional an Messaging-Team eskalieren, bei drohender SLA-Verletzung hierarchisch eskalieren, Workaround (Webmail), nach Lösung Problem-Analyse. | P: 4

### Wiederkehrende VPN-Abbrüche
Seit drei Wochen melden Außendienstler täglich VPN-Abbrüche. Jedes Ticket wird mit „Client neu gestartet“ geschlossen.
- F: Was ist versäumt worden? | A: Kein Problem Management – die Häufung wurde nicht als Problem erfasst und die Ursache nicht untersucht. | P: 2
- F: Wie gehen Sie vor? | A: Problem-Ticket anlegen, Incidents verknüpfen, Logs/Muster analysieren (Uhrzeit, Client-Version, Gateway), Ursache finden, Lösung als Change umsetzen, Known Error dokumentieren. | P: 4

### Qualität im Service Desk verbessern
Die Erstlösungsquote liegt bei 45 %, die Kundenzufriedenheit sinkt.
- F: Wie gehen Sie nach PDCA vor? | A: Plan: Ziel 65 %, Ursachen analysieren (fehlendes Wissen). Do: Wissensdatenbank, Schulungen, Skripte. Check: Quote und Zufriedenheit messen. Act: Erfolgreiches standardisieren, sonst nachsteuern. | P: 4
- F: Nennen Sie zwei weitere sinnvolle KPIs. | A: Mittlere Lösungszeit (MTTR), SLA-Erfüllungsgrad, Kundenzufriedenheit, Anzahl wiedereröffneter Tickets. | P: 2
