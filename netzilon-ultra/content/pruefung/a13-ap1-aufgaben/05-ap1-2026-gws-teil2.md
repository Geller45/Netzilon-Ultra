---
id: ap1-2026-gws-teil2
bereich: Prüfung
block: A13
kapitel: AP1-Aufgaben
titel: AP1 2026 – GWS GmbH Teil 2 (Software & DB, Baustelle)
stufe: Fortgeschritten
typ: uebung
quellen: [2026_-_AP1_-_FiSi_1_1-1.pdf (Scan), Lösungen erarbeitet und nachgerechnet]
verweise: [ap1-2026-gws-teil1, ap1-a2-dateisysteme, ap1-a2-backup, ap1-a5-vpn]
---

## Profi

### Aufgabe 3 (25 P) – Software für Kunden, Wartung, Termine, Material
| Teil | Punkte | Thema |
|---|---|---|
| a | 4 | GPL: zwei Grundgedanken |
| ba | 6 | Schreibtischtest |
| bb | 3 | Fehler bei ungleichen Arrays |
| ca | 9 | ER-Diagramm |
| cb | 3 | Datentypen |

**3ba Schreibtischtest** (`qmPerRadiator = 20`, Ganzzahldivision!)
| i | size | 1 + size/20 | poorlyInsulated | radiators | totalRadiators |
|---|---|---|---|---|---|
| 0 | 19 | 1 + 0 = 1 | false | 1 | 1 |
| 1 | 25 | 1 + 1 = 2 | true | 3 | 4 |
| 2 | 9 | 1 + 0 = 1 | false | 1 | 5 |
| 3 | 18 | 1 + 0 = 1 | false | 1 | 6 |
| 4 | 42 | 1 + 2 = 3 | true | 4 | **10** |

**Ausgabe: 10**

**3ca ER-Diagramm**
| Entität | Attribute | Schlüssel |
|---|---|---|
| Kunde | KundenNr, Name, Vorname, PLZ, Ort, Straße | PK KundenNr |
| Heizung | HeizungsNr, DatumEinbau, Heizungstyp, Baujahr | PK HeizungsNr, FK KundenNr |
| Wartung | WartungsNr, Wartungsdatum, Preis, Wartungszeit (min) | PK WartungsNr, FK HeizungsNr |

Beziehungen: **Kunde 1 – besitzt – n Heizung**, **Heizung 1 – erhält – n Wartung**.
Alternative (auch richtig): Wartung **m:n** Heizung (ein Wartungstermin für mehrere Heizungen), dann wandern **Preis** und **Wartungszeit** als Attribute an die Beziehung „wird gewartet“ (Zwischentabelle).

**3cb Datentypen**
| Attribut | Beispiel | Datentyp | Begründung |
|---|---|---|---|
| DatumEinbau | 29.06.2025 | **DATE** | Datumsprüfung, Sortierung, Datumsrechnung möglich |
| PLZ | 07973 | **CHAR(5)** / VARCHAR | führende 0 bleibt erhalten, keine Rechnung damit |
| Wartungszeit | 90 | **INTEGER** | ganze Minuten, Summen/Durchschnitt für Statistik |

### Aufgabe 4 (25 P) – Digitalisierung auf Baustellen
**4c Maßnahmen mobil**
| Maßnahme | Grund | Folge bei Nichtbeachtung |
|---|---|---|
| Festplatten-/Geräteverschlüsselung (BitLocker) | Laptop/Smartphone kann gestohlen werden oder verloren gehen | Unbefugte lesen Kundendaten → DSGVO-Verstoß, Bußgeld, Imageschaden |
| VPN statt offenem WLAN/Hotspot | Daten laufen über fremde, unsichere Netze | Abhören/Mitlesen (Man-in-the-Middle), Zugangsdaten gestohlen |
| Blickschutzfilter + Bildschirmsperre | Dritte schauen über die Schulter | Ausspähen vertraulicher Daten |
| MFA + Mobile Device Management | zentrale Kontrolle, Fernlöschung | Fremdzugriff auf Firmenkonten |

**4ea VPN**
Virtual Private Network: Über ein **öffentliches Netz** (Internet) wird ein **verschlüsselter Tunnel** aufgebaut. Daten werden **gekapselt** und **verschlüsselt**, beide Endpunkte **authentifizieren** sich. Das entfernte Gerät verhält sich logisch so, als wäre es **im Firmennetz** (z. B. IPsec, OpenVPN, WireGuard, SSL-VPN).

**4eb Datenschutz vs. Datensicherheit**
| | Datenschutz | Datensicherheit |
|---|---|---|
| Schützt | **personenbezogene** Daten, Persönlichkeitsrecht | **alle** Daten (egal ob personenbezogen) |
| Grundlage | DSGVO, BDSG | technisch-organisatorische Maßnahmen (TOM), BSI-Grundschutz |
| Beispiel | Kundenadressen nicht an Dritte weitergeben, nur zweckgebunden nutzen | tägliches Backup über VPN, Virenschutz, USV, Zugriffsrechte |

## Einfach

Die **GPL** ist wie ein **Rezept, das jeder kochen, verändern und weitergeben darf**. Aber: Wer ein verändertes Rezept weitergibt, muss es **wieder offen** weitergeben (Copyleft).

Beim **Schreibtischtest** spielst du den Computer: Für jeden Raum rechnest du 1 + Fläche/20 (**Nachkommastellen fallen weg!**), bei schlechter Isolierung **+1**, und zählst alles zusammen. Ergebnis: **10 Heizkörper**.

Hat das Raum-Array **5** Einträge, das Isolierungs-Array aber nur **4**, fragt das Programm beim 5. Raum nach einem Kästchen, das **es nicht gibt** → Absturz.

**FAT32** versteht fast jedes Gerät, aber eine Datei darf **höchstens 4 GB** groß sein.

**VPN** ist ein **blickdichter Tunnel** durchs Internet bis in die Firma.

## Merksatz
- **int / int = abschneiden**: 42/20 = 2, 19/20 = 0.
- **Array kürzer als Schleife → IndexOutOfRangeException.**
- **PLZ ist Text** (führende Null!).
- **FAT32: überall lesbar, max. 4 GiB pro Datei.**
- **Datenschutz schützt Menschen, Datensicherheit schützt Daten.**
- **Backup + Redundanz = kurze Ausfallzeit.**

## Prüfungsfalle
- Schreibtischtest: **19/20 = 0**, nicht 0,95 und nicht gerundet auf 1.
- Bei 3bb nicht nur „Fehler“ schreiben: **Index 4 existiert nicht im Array insulation (Länge 4) → Laufzeitfehler, Programmabbruch**, Schleife läuft über `roomSizes.Length` (5).
- PLZ als INTEGER → aus 07973 wird 7973.
- Datenschutz ≠ Datensicherheit: Ein Backup ist **Datensicherheit**, DSGVO-Einwilligung ist **Datenschutz**.
- Bei f die **zwei** Lösungen nennen: **Datensicherung (Backup-Verfügbarkeit)** und **Redundanz**, nicht „Cyberangriffe“ übersetzen.

## Grafik
### Schreibtischtest
Tabelle füllt sich Zeile für Zeile; bei true leuchtet „+1“ auf, rechts zählt totalRadiators bis 10 hoch. Danach Variante 3bb: Bei i = 4 greift die Schleife ins Leere, rote Fehlermeldung IndexOutOfRangeException.

### ER-Modell
Drei Rechtecke Kunde – Heizung – Wartung, Rauten „besitzt“ und „erhält“, Kardinalitäten 1:n und 1:n, Schlüssel unterstrichen.

## Übungen
- A: (3a) Beschreibe zwei Grundgedanken der GNU GPL. | L: 1) Freiheit: Software darf ohne Lizenzgebühr genutzt, untersucht, verändert und weitergegeben werden (Quellcode muss verfügbar sein). 2) Copyleft: Veränderte/abgeleitete Software muss bei Weitergabe wieder unter der GPL mit Quellcode veröffentlicht werden. (Zusatz: Verkauf erlaubt, Haftung/Gewährleistung ausgeschlossen.)
- A: (3ba) rooms = {19, 25, 9, 18, 42}, insulation = {false, true, false, false, true}, qmPerRadiator = 20, radiators = 1 + size/20 (+1 bei true). Ausgabe? | L: 1 + 3 + 1 + 1 + 4 = 10
- A: (3bb) rooms = {52, 9, 23, 29, 32}, insulation = {true, false, true, false}: Welches Problem entsteht? | L: Das Array insulation hat nur 4 Elemente (Index 0–3), die Schleife läuft aber über roomSizes.Length = 5. Bei i = 4 greift poorlyInsulated[4] auf einen nicht vorhandenen Index zu → Laufzeitfehler IndexOutOfRangeException, Programmabbruch, kein Ergebnis. Abhilfe: Längen vorher prüfen.
- A: (3ca) Erstelle das ER-Diagramm Kunde – Heizung – Wartung. | L: Kunde (PK KundenNr, Name, Vorname, PLZ, Ort, Straße) 1:n besitzt Heizung (PK HeizungsNr, DatumEinbau, Heizungstyp, Baujahr, FK KundenNr) 1:n erhält Wartung (PK WartungsNr, Wartungsdatum, Preis, Wartungszeit in Minuten, FK HeizungsNr).
- A: (3cb) Datentyp DatumEinbau (29.06.2025)? | L: DATE, weil Datumswerte geprüft, sortiert und berechnet werden können.
- A: (3cb) Datentyp PLZ (07973)? | L: CHAR(5) bzw. VARCHAR, weil die führende 0 erhalten bleiben muss und nicht damit gerechnet wird.
- A: (3cb) Datentyp Wartungszeit (90)? | L: INTEGER, ganze Minuten, Berechnungen (Summe, Durchschnitt) für die Statistik.
- A: (4a) Nenne zwei Möglichkeiten für Internet auf der Baustelle. | L: Mobilfunk-Router (LTE/5G) mit SIM; Smartphone-Hotspot (Tethering); Satelliteninternet (z. B. Starlink); temporärer DSL-/Glasfaser-Baustellenanschluss; Richtfunk.
- A: (4ba) Ein Vor- und ein Nachteil von FAT32? | L: Vorteil: sehr hohe Kompatibilität (Windows, Linux, macOS, Router, Kameras). Nachteil: max. Dateigröße 4 GiB − 1 Byte, keine Rechte/Verschlüsselung, kein Journaling (Datenverlust bei Abbruch).
- A: (4bb) Zwei konkrete Maßnahmen zum IT-Grundschutz im Baucontainer? | L: Diebstahlschutz (abschließbarer Container/Schrank, Kensington-Schloss, Alarm); Schutz vor Staub, Feuchtigkeit, Temperatur (Rugged-Gerät, Gehäuse); Überspannungsschutz/USV; Festplattenverschlüsselung und Bildschirmsperre.
- A: (4c) Maßnahme mobil 1 mit Grund und Folge? | L: Geräteverschlüsselung (BitLocker); Grund: Verlust/Diebstahl auf der Baustelle; Folge: Unbefugte lesen Kundendaten → DSGVO-Bußgeld, Imageschaden.
- A: (4c) Maßnahme mobil 2 mit Grund und Folge? | L: VPN bei fremden/öffentlichen Netzen; Grund: unsichere Übertragungswege; Folge: Daten und Zugangsdaten werden mitgelesen (Man-in-the-Middle).
- A: (4d) Beschreibe Spyware. | L: Schadsoftware, die unbemerkt Nutzerdaten ausspioniert (Passwörter, Tastatureingaben, Surfverhalten) und an Dritte sendet.
- A: (4d) Beschreibe Scareware. | L: Software/Pop-ups, die mit gefälschten Warnungen (z. B. „Virus gefunden!“) Angst erzeugen, damit der Nutzer schädliche oder nutzlose Software kauft/installiert oder Daten preisgibt.
- A: (4d) Beschreibe Ransomware. | L: Erpressungstrojaner: verschlüsselt Daten oder sperrt das System und fordert Lösegeld (meist Kryptowährung) für die Entschlüsselung.
- A: (4ea) Erkläre Begriff und Grundprinzip von VPN. | L: Virtual Private Network: logisch privates Netz über ein öffentliches Netz. Zwischen Client und Firmennetz wird ein Tunnel aufgebaut, die Daten werden gekapselt, verschlüsselt und die Endpunkte authentifiziert → sicherer Zugriff, als wäre man im Firmennetz.
- A: (4eb) Unterschied Datenschutz und Datensicherheit mit je einem Beispiel. | L: Datenschutz schützt Personen vor Missbrauch ihrer personenbezogenen Daten (DSGVO), z. B. Kundendaten nur zweckgebunden verwenden, nicht weitergeben. Datensicherheit schützt alle Daten technisch/organisatorisch vor Verlust, Manipulation, unbefugtem Zugriff, z. B. tägliches Backup über VPN, Virenschutz.
- A: (4f) Welche zwei Lösungen zur Minimierung der Ausfallzeiten nennt der Text („Ensuring backup availability and redundancy …“)? | L: 1) Verfügbarkeit von Datensicherungen (Backups). 2) Redundanz (doppelt vorhandene Systeme/Komponenten).

## Quiz
? Ausgabe des Schreibtischtests mit rooms {19,25,9,18,42} und insulation {f,t,f,f,t}?
* 10
- 9
- 12
- 8
! 1 + 3 + 1 + 1 + 4 = 10 (Ganzzahldivision).

? Was ergibt 19 / 20 bei int-Variablen in C#?
* 0
- 1
- 0,95
- Fehler

? Welcher Fehler tritt bei insulation mit 4 statt 5 Elementen auf?
* IndexOutOfRangeException
- NullReferenceException
- DivideByZeroException
- Endlosschleife

? Was beschreibt Copyleft in der GPL?
* Abgeleitete Software muss wieder unter der GPL weitergegeben werden
- Software darf nicht verkauft werden
- Der Quellcode bleibt geheim
- Nur private Nutzung ist erlaubt

? Bester Datentyp für die PLZ 07973?
* CHAR(5)
- INTEGER
- FLOAT
- DATE
! Führende Null muss erhalten bleiben.

? Kardinalität Kunde – Heizung?
* 1:n
- 1:1
- n:1
- keine Beziehung

? Größte Datei auf FAT32?
* 4 GiB − 1 Byte
- 2 TiB
- 16 EiB
- 32 GiB

? Welche Malware verschlüsselt Daten und fordert Lösegeld?
* Ransomware
- Spyware
- Scareware
- Adware

? Tägliches Backup gehört zu …
* Datensicherheit
- Datenschutz
- Datenminimierung
- Zweckbindung

? Welche zwei Lösungen nennt der englische Text zur Minimierung der Ausfallzeit?
* Backup-Verfügbarkeit und Redundanz
- Firewall und Antivirus
- Verschlüsselung und VPN
- Schulung und Richtlinien
