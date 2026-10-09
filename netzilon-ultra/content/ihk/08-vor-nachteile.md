---
id: ihk-vor-nachteile
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: Vor- und Nachteile – Cloud, Virtualisierung, LTO, Routing, WLAN-Sicherheit, TLS-Inspection
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2]
quellen: [Vor- & Nachteile.docx, Vor- & Nachteile.pdf, Ergänzung Lernzettel.docx, Lernzettel_AP1AP2_2024.pdf]
verweise: [ihk-lernzettel-guide, ihk-handlungsschritte, wiso-kostenrechnung]
---

## Profi

IHK-Aufgaben fragen oft „Nennen Sie zwei Vor- und zwei Nachteile …“. Diese Gegenüberstellungen sind Pflichtstoff.

| Thema | Vorteile | Nachteile |
|---|---|---|
| **On-Premises** | volle Kontrolle über Hardware und Daten; interner Zugriff unabhängig vom Internet; keine laufenden Mietkosten | hohe Investition, eigener Betrieb/Wartung, begrenzte Skalierung |
| **Public Cloud / SaaS** | Skalierbarkeit bei Lastspitzen; Pay-per-use; geringer Wartungsaufwand; schnelle Bereitstellung (Time-to-Market) | Abhängigkeit von Provider und Internetanbindung; Datenschutz (Drittstaaten, DSGVO); Vendor-Lock-in |
| **Virtualisierung vs. physisch** | bessere Hardwareauslastung (Konsolidierung); Snapshots, schnelle Migration/Wiederherstellung; weniger Platz und Strom | Single Point of Failure (Host fällt aus); Overhead durch Hypervisor; Lizenzkosten |
| **LTO-Band vs. Disk** | niedrige Kosten pro TB; **Air Gap** (Schutz vor Ransomware); lange Haltbarkeit; transportabel für Auslagerung | langsamer sequenzieller Zugriff; Laufwerke/Management; Restore langsamer |
| **Statisches Routing** | einfach in kleinen Netzen; kein Protokoll-Overhead; geringe CPU-Last; berechenbar | manueller Aufwand; keine automatische Anpassung bei Ausfall |
| **Dynamisches Routing** | automatische Anpassung/Redundanz; skalierbar; Lastverteilung | Protokoll-Overhead; komplexere Konfiguration; höherer Ressourcenbedarf |
| **WLAN PSK vs. RADIUS (Enterprise)** | RADIUS: individuelle Zugangsdaten, kein Passwortwechsel für alle bei Weggang, zentrale Verwaltung und Protokollierung | RADIUS: höherer Einrichtungs- und Wartungsaufwand (Server, Zertifikate); PSK: ein gemeinsames Passwort |
| **TLS-/SSL-Inspection (NGFW)** | verschlüsselten Traffic auf Malware prüfen | hoher Rechenaufwand; Datenschutz/Betriebsrat; bricht Ende-zu-Ende-Verschlüsselung |
| **Deduplizierung** | massive Platzersparnis (Blöcke nur einmal) | CPU/RAM-Last, Wiederherstellung komplexer |
| **CSV-Dateien** | einfach, menschenlesbar, fast überall importierbar | keine Datentypen/Beziehungen, Trennzeichen-Probleme, kein Schema |
| **Pseudocode** | sprachunabhängig, konzentriert auf Logik, für Nicht-Programmierer verständlich | nicht ausführbar, kein einheitlicher Standard |
| **LWL vs. Kupfer** | große Reichweite, hohe Bandbreite, EMV-unempfindlich, abhörsicherer | teurer, empfindlicher, Spezialwerkzeug |
| **JBOD vs. RAID** | volle Kapazität, einfach | keine Redundanz, Totalverlust bei Plattenausfall, kein Performancegewinn |

### Prüfungsstil
Antworten **fallbezogen** formulieren („Bei 20 Mitarbeitern und Homeoffice …“). Bei „Bewerten Sie“: Fazit mit Empfehlung. Nie nur „billiger“ / „besser“ schreiben, sondern **warum**.

## Einfach

Fast jede Technik hat zwei Seiten, so wie beim **Fahrrad und Auto**: Das Auto ist schnell, aber kostet Sprit. Das Rad ist günstig, aber langsamer.

**Eigener Server im Keller vs. Cloud:**
- Eigener Server: Alles gehört dir, du bestimmst, aber du musst ihn selbst warten und bezahlen, wenn er kaputt geht.
- Cloud: Wie Wohnung mieten. Du zahlst nur, was du brauchst, andere kümmern sich ums Haus. Aber: Wenn das Internet weg ist, kommst du nicht rein. Und deine Daten liegen woanders.

**Virtuelle Maschinen:** Ein großer Computer tut so, als wären es viele kleine. Das spart Platz und Strom. Aber wenn der große Computer ausfällt, sind alle kleinen auch weg.

**Bandlaufwerk (LTO):** Wie eine alte Kassette, aber riesig. Billig für viel Platz, lange haltbar, und man kann sie aus dem Schrank holen, sodass Hacker nicht drankommen (Air Gap). Aber: Spulen dauert.

**Routing:**
- Statisch: Du schreibst den Weg selbst auf einen Zettel. Einfach, aber wenn die Straße gesperrt ist, sagt dir keiner Bescheid.
- Dynamisch: Navi-App. Findet selbst Umwege. Braucht aber Datenverkehr und mehr Aufwand.

**WLAN-Passwort:** Ein Passwort für alle (PSK): einfach, aber wenn jemand geht, müssen alle das neue Passwort bekommen. Mit RADIUS hat jeder sein eigenes Login, und man sperrt nur das eine.

**TLS-Inspection:** Die Firewall macht Briefe auf, um zu schauen, ob etwas Böses drin ist. Gut gegen Viren, aber heikel für den Datenschutz.

Tipp: Lerne zu jedem Thema je zwei Vorteile und zwei Nachteile in Stichworten.

## Merksatz
- Cloud: flexibel, aber abhängig. On-Prem: Kontrolle, aber Aufwand.
- Virtualisierung: spart, aber Single Point of Failure.
- Band: billig und offline, aber langsam.
- Statisch: einfach, dynamisch: schlau.
- PSK: ein Passwort für alle, RADIUS: jeder eigenes.

## Prüfungsfalle
- „Nennen Sie Vorteile“: keine Nachteile mischen.
- Vorteile müssen fallbezogen und konkret sein.
- Datenschutz bei Cloud (Drittland) und Betriebsrat bei Inspection nicht vergessen.
- Statisch/dynamisch: Overhead nur bei dynamisch.
- LTO: Air Gap ist DER Ransomware-Vorteil.

## Grafik
### Cloud oder On-Premises entscheiden
1. Geschäftsführung -> IT-Leiter: Lastspitzen im Weihnachtsgeschäft
2. IT-Leiter: Skalierbarkeit spricht für Cloud
3. Datenschutzbeauftragter -> IT-Leiter: Kundendaten dürfen nicht ins Drittland
4. IT-Leiter: Hybrid-Lösung wählen
5. IT-Leiter -> Geschäftsführung: Empfehlung mit Begründung

## Spickzettel
- Cloud: Skalierung, Pay-per-use / Abhängigkeit, Datenschutz
- VM: Auslastung, Snapshots / SPOF, Overhead
- LTO: günstig, Air Gap / langsam
- Statisch: einfach / manuell; Dynamisch: automatisch / Overhead
- RADIUS: individuell / aufwendig
- TLS-Inspection: Malware sehen / Rechenlast, Datenschutz

## Freitext
- F: Nennen Sie zwei Vorteile und einen Nachteil der Servervirtualisierung. | M: Bessere Auslastung, Snapshots/Migration; Nachteil Single Point of Failure oder Hypervisor-Overhead | P: 3
- F: Begründen Sie, warum LTO-Bänder noch eingesetzt werden. | M: Geringe Kosten pro TB, lange Haltbarkeit, Air Gap als Ransomware-Schutz, Transportabilität | P: 3
- F: Nennen Sie zwei Vorteile von WLAN mit RADIUS gegenüber PSK. | M: Individuelle Zugangsdaten, zentrale Verwaltung/Protokollierung, kein Passwortwechsel für alle | P: 2

## Karteikarten
- F: Zwei Vorteile Public Cloud? | A: Skalierbarkeit, Pay-per-use, geringer Wartungsaufwand
- F: Zwei Nachteile Public Cloud? | A: Provider- und Internetabhängigkeit, Datenschutzrisiken
- F: Hauptnachteil Virtualisierung? | A: Single Point of Failure beim Host
- F: Hauptvorteil Virtualisierung? | A: Bessere Hardwareauslastung durch Konsolidierung
- F: Vorteil LTO? | A: Günstig pro TB, Air Gap, lange Haltbarkeit
- F: Nachteil LTO? | A: Langsamer sequenzieller Zugriff
- F: Vorteil statisches Routing? | A: Einfach, kein Overhead
- F: Vorteil dynamisches Routing? | A: Automatische Anpassung, Skalierbarkeit
- F: Vorteil RADIUS? | A: Individuelle Authentifizierung und zentrale Protokollierung
- F: Nachteil TLS-Inspection? | A: Rechenaufwand und Datenschutzbedenken
- F: Nachteil CSV? | A: Keine Datentypen und keine Verknüpfungen

## Quiz
? Was ist ein Vorteil von LTO-Bändern?
* Air Gap als Schutz vor Ransomware
- Sehr schneller Direktzugriff
- Keine Anschaffungskosten
- Eingebauter Virenscanner

? Was ist ein Nachteil der Servervirtualisierung?
* Single Point of Failure beim Host
- Höherer Stromverbrauch
- Mehr Platzbedarf
- Keine Snapshots

? Was ist ein Vorteil von Public Cloud?
* Schnelle Skalierbarkeit
- Volle Kontrolle über die Hardware
- Keine Abhängigkeit vom Internet
- Keine Datenschutzfragen

? Was ist ein Vorteil von dynamischem Routing?
* Automatische Anpassung bei Topologieänderungen
- Kein Protokoll-Overhead
- Keine Konfiguration nötig
- Geringste CPU-Last

? Warum wird RADIUS in Unternehmen statt PSK eingesetzt?
* Individuelle Zugangsdaten pro Nutzer
- Weil es ohne Server funktioniert
- Weil das WLAN schneller wird
- Weil keine Verschlüsselung nötig ist

? Was ist ein Vorteil der Deduplizierung?
* Platzersparnis durch einmalige Speicherung identischer Blöcke
- Höhere CPU-Taktung
- Verschlüsselung
- Schnelleres Netzwerk

? Was ist ein Nachteil von JBOD gegenüber RAID?
* Keine Redundanz
- Weniger nutzbare Kapazität
- Teurere Platten
- Kein Zugriff

? Was ist ein Nachteil von CSV?
* Keine Unterstützung für Datentypen und Beziehungen
- Nicht lesbar
- Zu klein
- Nur für Windows

? Welcher Vorteil gilt für Lichtwellenleiter gegenüber Kupfer?
* EMV-Unempfindlichkeit und große Reichweite
- Günstigere Stecker
- Einfachere Verlegung
- Stromversorgung über das Kabel
