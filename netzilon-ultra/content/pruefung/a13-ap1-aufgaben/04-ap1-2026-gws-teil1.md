---
id: ap1-2026-gws-teil1
bereich: Prüfung
block: A13
kapitel: AP1-Aufgaben
titel: AP1 2026 – GWS GmbH Teil 1 (Projekt, PC & Netzwerk)
stufe: Fortgeschritten
typ: uebung
quellen: [2026_-_AP1_-_FiSi_1_1-1.pdf (Scan), Lösungen erarbeitet und nachgerechnet]
verweise: [ap1-2026-gws-teil2, ap1-a3-binaerpraefixe, ap1-a1-arbeitsspeicher, ap1-a4-netzwerkgrundlagen, ap1-a4-topologie]
---

## Profi

### Ausgangssituation (Aufgaben 1–4)
Du bist Azubi im Systemhaus **Novo-Sys-Tech OHG** (EDV-Support für KMU). Kunde ist die **GWS GmbH** (Haustechnik: Heizungsanlagen bis Bäder). Die GWS erweitert ihre Geschäftsräume inkl. Ausstellungsflächen und repräsentativem Empfang. Dein Team unterstützt dabei.

### Aufgabe 1 (25 P) – Projekt „Webseite erstellen“
| Teil | Punkte | Thema |
|---|---|---|
| a | 7 | Anwendungsfalldiagramm (UML) erweitern |
| b | 4 | SMART-Kriterien zuordnen |
| c | 4 | Wasserfallmodell: Vor- und Nachteil |
| d | 6 | Kostenvergleich intern/extern |
| e | 4 | Reaktionen auf verpassten Meilenstein |

**1a Lösung Anwendungsfalldiagramm**
- Akteur **Benutzer** (Oberklasse) mit zwei Spezialisierungen (Generalisierungspfeil zum Benutzer): **nicht registrierter Benutzer** (vorgegeben) und **registrierter Benutzer** (neu).
- **Benutzer** – Assoziation – **Artikel suchen** (beide Arten dürfen suchen).
- **Beschreibung und Bilder betrachten** → `<<extend>>` → **Artikel suchen**, am Erweiterungspunkt **EP: betrachten**, Notiz `Condition: {falls gewünscht}`.
- **nicht registrierter Benutzer** – **registrieren** (vorgegeben).
- **registrierter Benutzer** – Assoziation – **Artikel anfragen**.
- **Artikel anfragen** → `<<include>>` → **anmelden** (Anmeldung immer Pflicht).

| Beziehung | Pfeilrichtung | Bedeutung |
|---|---|---|
| `<<include>>` | Basis → eingebundener Fall | wird **immer** ausgeführt |
| `<<extend>>` | Erweiterung → Basis | **optional**, nur unter Bedingung |
| Generalisierung | Spezial → Allgemein (hohles Dreieck) | erbt alle Anwendungsfälle |

**1b SMART**
| Beschreibung | Kriterium |
|---|---|
| Entwicklung der Webseite mit allen Anwendungsfällen | messbar (vorgegeben) |
| „Artikel suchen“ mit Java über gesamten Artikelbestand | **spezifisch** |
| Webseite muss am 01.12.2026 zur Verfügung stehen | **terminiert** |
| Zeit ausreichend, Puffer von einer Woche | **realistisch** |
| Allen Projektmitgliedern ist die Zielerreichung wichtig | **akzeptiert** |

**1d Kostenvergleich**
| | Einarbeitung | Entwicklung | Übergabe | Summe |
|---|---|---|---|---|
| intern (85 €/h) | 4 h · 85 = **340 €** | 6 h · 85 = **510 €** | – | **850 €** |
| extern (145 €/h) | – | 4 h · 145 = **580 €** | 1 h · 145 + 1 h · 85 = **230 €** | **810 €** |

Bei der Übergabe sind **zwei Personen** gebunden (externer Spezialist erklärt, interner Mitarbeiter hört zu). Wer nur den Externen rechnet: 145 € → Summe 725 €. Ergebnis in beiden Fällen: **externe Vergabe ist günstiger**.

### Aufgabe 2 (25 P) – PC im Ausstellungsbereich
PC: Ryzen 7 3,60 GHz, 32 GB DDR5, 1.000 GB M.2-SSD, WiFi 6E, LAN 1 Gbit/s, 3× USB-C.

**2a 1.000 GB ≠ 931 GiB?**
Hersteller rechnen **dezimal** (1 GB = 10^9 Byte), Windows rechnet **binär** (1 GiB = 2^30 Byte = 1.073.741.824 Byte), zeigt aber teils „GB“ an.

`1.000 GB = 1.000 · 10^9 Byte = 10^12 Byte`
`10^12 Byte : 1024^3 = 10^12 : 1.073.741.824 ≈ 931,32 GiB`

**2cd OSI-Tabelle**
| OSI-Schicht | Protokoll | Test | Erwartetes Ergebnis |
|---|---|---|---|
| Application | HTTPS | **www.google.de im Browser aufrufen** | Google-Seite wird angezeigt |
| Application | DNS | nslookup www.google.de | **Antwort mit IP-Adresse(n) von www.google.de** (IPv4/IPv6) |
| **Network Layer** (Vermittlung) | IP | ping 2a00:1450:4016:802::2003 | Echo-Reply |
| Data Link | **Ethernet (IEEE 802.3)** | LED an Netzwerkkarte | LED blinkt, Frames werden gesendet |
| Physical | – | Sichtprüfung Patchkabel | keine äußeren Schäden |

**2da Schutzbedarf**
| IT-Anwendung | Schutzziel | Kategorie | Begründung |
|---|---|---|---|
| 3D-CAD | **Vertraulichkeit** | normal | kaum personenbezogene Daten |
| 3D-CAD | **Verfügbarkeit** | sehr hoch | Daten sehr wichtig für Auftragsabwicklung |
| Angebote | **Integrität** | hoch | Fehler im Angebot stören Abwicklung |
| Angebote | **Vertraulichkeit** | sehr hoch | personenbezogene Daten (DSGVO) |

## Einfach

Die Firma GWS verkauft Heizungen und Bäder und bekommt eine neue **Webseite** und einen neuen **PC**.

Beim **Anwendungsfalldiagramm** malst du Strichmännchen (wer?) und Ovale (was kann er?). „include“ heißt: **muss immer mit** (wer anfragen will, muss sich anmelden). „extend“ heißt: **kann dazukommen** (Bilder anschauen, wenn man will).

Die **SSD** hat 1.000 GB, Windows zeigt 931 an. Nichts ist kaputt: Der Hersteller zählt in **Tausendern**, Windows in **1024ern**. Wie wenn einer Äpfel in Zehnerkisten zählt und der andere in Zwölferkisten.

Zeigt ein Programm nur **16 GB** statt 32 GB RAM, ist vermutlich **ein Riegel kaputt**. Du testest jeden **einzeln**, wie Lichterketten-Birnen.

Beim **Patchkabel** ist die kleine **Plastiknase** abgebrochen. Der Stecker hält nicht mehr fest und rutscht aus der Buchse, deshalb kein Internet.

## Merksatz
- **include = immer, extend = vielleicht.**
- **GB × 0,931 ≈ GiB** (10^9 : 2^30).
- **SMART: Spezifisch – Messbar – Akzeptiert – Realistisch – Terminiert.**
- **Übergabe kostet zwei Leute.**
- **S = Schirm um alles, F = Folie, U = ungeschirmt, TP = verdrillte Paare.**
- **Schutzziele = CIA: Vertraulichkeit, Integrität, Verfügbarkeit.**

## Prüfungsfalle
- Bei `<<extend>>` zeigt der Pfeil **zur Basis** (Artikel suchen), bei `<<include>>` **vom Basisfall weg**.
- „Anmelden“ ist **include**, nicht extend: Ohne Anmeldung keine Anfrage.
- 931 GiB entsteht durch **1024^3**, nicht durch 1024 allein (1000/1024 = 976, falsch).
- **Cat 5e UTP** ist billig, aber **ungeschirmt** → nicht gleichwertig zum geschirmten Kabel.
- Bei IP-Ping heißt die Schicht **Network/Vermittlung**, nicht Transport.
- Schutzbedarf „personenbezogene Daten“ → immer **Vertraulichkeit**.

## Grafik
### Anwendungsfalldiagramm
Benutzer oben, darunter zwei Spezialisierungen. Ovale erscheinen nacheinander: Artikel suchen, Beschreibung/Bilder betrachten (gestrichelter extend-Pfeil zur Basis), Artikel anfragen mit include-Pfeil zu anmelden.

### GB → GiB
Ein Balken mit 1.000.000.000.000 Byte wird zuerst in Tausenderpäckchen und dann in 1024er-Päckchen geteilt; am Ende bleiben 931,32 Päckchen übrig.

## Übungen
- A: (1a) Ergänze das Anwendungsfalldiagramm: registrieren, Artikel suchen, Beschreibung/Bilder betrachten (falls gewünscht), Artikel anfragen (nur angemeldet). | L: Neuer Akteur „registrierter Benutzer“ als Spezialisierung von „Benutzer“; Benutzer – Artikel suchen; „Beschreibung und Bilder betrachten“ <<extend>> → Artikel suchen am EP betrachten (Condition: falls gewünscht); registrierter Benutzer – Artikel anfragen; Artikel anfragen <<include>> → anmelden.
- A: (1b) „Artikel suchen“ mit Java über den gesamten Artikelbestand: welches SMART-Kriterium? | L: spezifisch
- A: (1b) „Webseite muss am 01.12.2026 zur Verfügung stehen“: welches SMART-Kriterium? | L: terminiert
- A: (1b) „Zeit ausreichend, Puffer von einer Woche“: welches SMART-Kriterium? | L: realistisch
- A: (1b) „Allen Projektmitgliedern ist die Zielerreichung wichtig“: welches SMART-Kriterium? | L: akzeptiert
- A: (1c) Nenne einen Vor- und einen Nachteil des Wasserfallmodells. | L: Vorteil: klare, lineare Phasen, gut plan- und kontrollierbar, feste Meilensteine und gute Dokumentation. Nachteil: unflexibel, Änderungswünsche und Fehler werden erst spät erkannt (Rücksprung teuer), Kunde sieht das Ergebnis erst am Ende.
- A: (1d) Interne Kosten: 4 h Einarbeitung + 6 h Entwicklung zu 85 €/h? | L: Einarbeitung 340 €, Entwicklung 510 €, Summe 850 €.
- A: (1d) Externe Kosten: 4 h Entwicklung zu 145 €/h + 1 h Übergabe (extern 145 €, intern 85 €)? | L: Entwicklung 580 €, Übergabe 230 €, Summe 810 € → extern ist 40 € günstiger.
- A: (1e) Nenne zwei sinnvolle Reaktionen des Projektleiters, wenn der Meilenstein „Artikelsuche fertigstellen“ nicht erreicht wird. | L: Ursachen analysieren und Auswirkung auf Endtermin prüfen; Ressourcen erhöhen (mehr Personal, Überstunden, externen Spezialisten einkaufen); Projektplan/Termine anpassen und Puffer nutzen; Umfang priorisieren/reduzieren; Auftraggeber und Team informieren.
- A: (2a) Begründe 931 GiB statt 1.000 GB und rechne um. | L: Hersteller dezimal (10^9), Windows binär (2^30). 1.000 GB = 10^12 Byte; 10^12 : 1.073.741.824 ≈ 931,32 GiB.
- A: (2ba) Nenne zwei weitere Möglichkeiten, die RAM-Größe zu prüfen. | L: Task-Manager → Leistung → Arbeitsspeicher; Einstellungen → System → Info; msinfo32; BIOS/UEFI-Übersicht; PowerShell `Get-CimInstance Win32_PhysicalMemory`; Tool wie CPU-Z; Riegel ausbauen und Beschriftung lesen.
- A: (2bb) Einer von zwei 16-GB-Riegeln ist defekt: Vorgehen? | L: PC herunterfahren, vom Strom trennen, ESD-Schutz. Einen Riegel ausbauen, mit nur einem Riegel starten und RAM-Größe/Speichertest (Windows-Speicherdiagnose mdsched, MemTest86) prüfen. Dann Riegel tauschen und erneut testen. Der Riegel, mit dem der PC nicht startet, Fehler zeigt oder 0 GB erkannt werden, ist defekt (alternativ Steckplätze tauschen, um Slotdefekt auszuschließen).
- A: (2ca) Sichtprüfung Patchkabel: Zusammenhang zur unterbrochenen Verbindung? | L: Am RJ45-Stecker ist die Rastnase (Verriegelungslasche) abgebrochen. Der Stecker rastet nicht ein, rutscht aus der Buchse bzw. hat Wackelkontakt, dadurch keine physische Verbindung (Schicht 1) → „nicht mit dem Internet verbunden“.
- A: (2cb) Bedeutung von S, FTP und UTP? | L: S = Screened, Gesamtschirm (Geflecht) um alle Adern. FTP = Foiled Twisted Pair, verdrillte Adernpaare mit Folienschirm (je Paar). UTP = Unshielded Twisted Pair, verdrillte Paare ohne Schirmung.
- A: (2cc) Kostengünstigstes geeignetes Kabel (Cat 7 S/FTP 5,99 €, Cat 6a S/FTP 3,99 €, Cat 5e UTP 1,99 €)? | L: Produkt 2 (Cat 6a, S/FTP, 3,99 €): geschirmt wie das alte Kabel und 10 Gbit/s reichen für LAN 1 Gbit/s. Cat 5e UTP ist ungeschirmt, also nicht gleichwertig.
- A: (2cd) Test für HTTPS (Application Layer)? | L: Im Webbrowser www.google.de aufrufen.
- A: (2cd) Erwartetes Ergebnis von nslookup www.google.de? | L: Der DNS-Server liefert die IP-Adresse(n) von www.google.de (z. B. IPv6 2a00:1450:… und IPv4).
- A: (2cd) OSI-Schicht für IP/ping? | L: Network Layer (Schicht 3, Vermittlungsschicht).
- A: (2cd) Protokoll auf dem Data Link Layer (LED-Prüfung)? | L: Ethernet (IEEE 802.3), bei WLAN IEEE 802.11.
- A: (2da) Schutzziele: CAD normal / CAD sehr hoch / Angebot hoch / Angebot sehr hoch? | L: CAD normal = Vertraulichkeit; CAD sehr hoch = Verfügbarkeit; Angebot hoch = Integrität; Angebot sehr hoch = Vertraulichkeit.
- A: (2db) Nenne zwei IT-Sicherheitsmaßnahmen für diesen Schutzbedarf. | L: Verfügbarkeit: regelmäßige Datensicherung (3-2-1, extern/zentral), RAID, USV. Vertraulichkeit: Festplattenverschlüsselung (BitLocker), Zugriffsrechte, starke Passwörter/MFA, Bildschirmsperre. Integrität: Virenschutz, Updates, Vier-Augen-Prinzip beim Angebot.

## Quiz
? Wie heißt die UML-Beziehung, wenn ein Anwendungsfall IMMER einen anderen ausführt?
* <<include>>
- <<extend>>
- Generalisierung
- Assoziation
! Artikel anfragen schließt anmelden immer ein.

? Wohin zeigt der <<extend>>-Pfeil?
* Vom erweiternden Fall zum Basisfall
- Vom Basisfall zum erweiternden Fall
- Vom Akteur zum Anwendungsfall
- Er hat keine Richtung

? 1.000 GB entsprechen etwa …
* 931 GiB
- 976 GiB
- 1.024 GiB
- 954 GiB
! 10^12 : 2^30 ≈ 931,32.

? „Die Webseite muss am 01.12.2026 fertig sein“ ist …
* terminiert
- messbar
- realistisch
- spezifisch

? Was kostet die interne Lösung (4 h + 6 h à 85 €)?
* 850 €
- 810 €
- 510 €
- 725 €

? Was bedeutet UTP?
* Unshielded Twisted Pair
- Universal Twisted Pair
- Unified Transfer Protocol
- Unshielded Transfer Port

? Welches Kabel ist das günstigste gleichwertige Ersatzkabel für ein geschirmtes Patchkabel?
* Cat 6a S/FTP
- Cat 5e UTP
- Cat 7 S/FTP
- Cat 5 UTP

? Auf welcher OSI-Schicht arbeitet ping (ICMP/IP)?
* Network Layer
- Transport Layer
- Data Link Layer
- Session Layer

? Personenbezogene Kundendaten im Angebot betreffen vor allem welches Schutzziel?
* Vertraulichkeit
- Verfügbarkeit
- Integrität
- Authentizität

? Benchmark zeigt 16 GB statt 32 GB. Wahrscheinlichste Ursache?
* Ein RAM-Riegel ist defekt oder nicht erkannt
- Die SSD ist zu klein
- Windows rechnet in GiB
- Der Prozessor taktet zu niedrig
