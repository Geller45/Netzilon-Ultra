---
id: legacy-lebenszyklus
bereich: Legacy
block: A12
kapitel: Legacy-Box
titel: Legacy – Begriff, Lebenszyklus und Support-Ende
stufe: Einsteiger
quellen: [Microsoft Lifecycle Policy, eigene Zusammenstellung, Stand 09/2026]
verweise: [legacy-betrieb-absichern, legacy-streichliste-2025, ap2-it-sicherheit]
---

## Profi

### Was heißt „Legacy“?
**Legacy** (engl. „Erbe“, „Altlast“) bezeichnet Technik, die **noch läuft, aber überholt** ist: Sie wird vom Hersteller nicht mehr weiterentwickelt, oft nicht mehr mit Sicherheitsupdates versorgt und durch ein besseres Verfahren ersetzt. Typische Gründe, warum sie trotzdem existiert: eine **Spezialanwendung** (Fertigungssteuerung, Messgerät, Branchensoftware) läuft nur damit, der Ersatz ist zu teuer, oder niemand hat es dokumentiert.

Legacy ist **kein Fehler an sich**, aber ein **Risiko**: Sicherheitslücken bleiben offen (Schutzziel Vertraulichkeit/Integrität), Fachwissen geht verloren (Verfügbarkeit), Kompatibilität mit neuer Technik bricht.

### Support-Phasen bei Microsoft (Lifecycle)
| Phase | Inhalt |
|---|---|
| **Mainstream Support** | Sicherheits- **und** Funktionsupdates, Fehlerkorrekturen, Herstellersupport |
| **Extended Support** | **Nur noch Sicherheitsupdates** (keine neuen Funktionen); bei Server meist bis 10 Jahre nach Erscheinen |
| **Ende des Supports** (*End of Support*, EOS/EOL) | **Keine Updates mehr**, jede neue Lücke bleibt offen |
| **ESU** (*Extended Security Updates*) | **Kostenpflichtige** Sicherheitsupdates für ein paar Jahre nach EOS, für Windows Server 2012/2012 R2 z. B. bis 13.10.2026 (in Azure-VMs kostenlos, lokal kostenpflichtig, z. B. als Abo über Azure Arc) |

### Wichtige Termine (Stand 09/2026, vor der Prüfung bei Microsoft Lifecycle nachprüfen)
| Produkt | Ende Mainstream | Ende Extended |
|---|---|---|
| Windows XP | 2009 | **08.04.2014** |
| Windows 7 / Server 2008 R2 | 2015 | **14.01.2020** |
| Windows Server 2012 / 2012 R2 | 2018 | **10.10.2023** (ESU danach bis 13.10.2026) |
| Windows 10 | – | **14.10.2025** (ESU-Programm für Privatkunden/Firmen möglich) |
| Windows Server 2016 | 11.01.2022 | **12.01.2027** |
| Windows Server 2019 | 09.01.2024 | **09.01.2029** |
| Windows Server 2022 | **13.10.2026** | **14.10.2031** |
| Windows Server 2025 | 09.11.2029 | **10.11.2034** |

Merke die **Logik**: Server-LTSC-Versionen bekommen **5 Jahre Mainstream + 5 Jahre Extended**. Nach dem Extended-Ende ist ein System **Legacy im engen Sinn**.

### Legacy-Arten
| Art | Beispiele |
|---|---|
| **Betriebssystem** | Windows 7, Server 2008 R2, Windows 10 nach EOS |
| **Protokoll/Dienst** | SMB1, NTLMv1, WINS, Telnet, FTP, SNMPv1 |
| **Verschlüsselung** | WEP, TKIP, SSL 3.0, TLS 1.0/1.1, DES, RC4, MD5, SHA-1 |
| **Hardware/Schnittstelle** | Diskette, PS/2, VGA, IDE/PATA, serieller Port, BIOS-Boot |
| **Verwaltung/Skript** | CMD-Batch, VBScript, WMIC, PowerShell 2.0 |
| **Anwendung** | Nur 16-Bit/32-Bit-Software, hart codierte IPs, Java-Applets |

### Warum Legacy gefährlich ist
1. **Keine Patches** – bekannte Lücken (z. B. EternalBlue/WannaCry über SMB1, 2017) bleiben dauerhaft ausnutzbar.
2. **Schwache Kryptografie** – Kennwörter und Daten sind mitlesbar oder offline knackbar.
3. **Compliance** – DSGVO (Stand der Technik), BSI-Grundschutz, Versicherungen und Kundenaudits verlangen unterstützte Systeme.
4. **Seitwärtsbewegung** – ein einziges Altgerät im Netz reicht dem Angreifer als Sprungbrett.
5. **Betriebsrisiko** – Ersatzteile und Fachleute fehlen, Ausfallzeit (MTTR) steigt.

### Legacy im Betrieb behandeln (Kurzüberblick, Details siehe eigene Seite)
Inventarisieren → Risiko bewerten → **isolieren** (VLAN, Firewall) → **ersetzen oder migrieren** → dokumentieren.

## Einfach

Stell dir vor, dein Schulbus ist **20 Jahre alt**. Er fährt noch. Aber:
- Der Hersteller macht **keine Ersatzteile** mehr (kein Support).
- Er hat **keine modernen Sicherheitsgurte und keine Airbags** (keine Sicherheitsupdates).
- Nur **ein Mechaniker** im Ort kennt ihn (Wissen weg).
- Er passt nicht mehr in die **neue Umweltzone** (Kompatibilität/Vorschriften).

Trotzdem fährst du ihn, weil ein **neuer Bus 200.000 Euro** kostet. Das ist **Legacy**. Ein vernünftiger Chef sagt nicht „Bus sofort verschrotten“, sondern: „Wir fahren ihn nur noch auf der **kurzen, sicheren Strecke** (isolieren), planen den **neuen Bus** (Migration) und schreiben auf, **wann** der alte weg muss (Termin).“

**Mainstream Support** ist wie „Werkstatt macht alles: Reparatur **und** Verbesserungen“. **Extended Support** ist wie „Werkstatt repariert nur noch **gefährliche Defekte**“. **Ende des Supports** heißt: „Die Werkstatt hat zu.“ **ESU** ist die **teure Sonderwerkstatt**, die noch ein paar Jahre gegen Bezahlung repariert.

## Merksatz
- **5 + 5**: 5 Jahre Mainstream, 5 Jahre Extended (bei Windows Server LTSC).
- Extended = **nur Sicherheitsupdates**.
- Nach EOS gibt es **keine Updates** – außer kostenpflichtig per **ESU**.
- Legacy = **Risiko**, nicht automatisch „sofort abschalten“ → erst **isolieren**, dann **ersetzen**.

## Prüfungsfalle
- „Läuft doch noch“ ist **kein** Argument gegen Migration – es geht um **Support und Sicherheit**, nicht um Funktion.
- **Mainstream-Ende ≠ Support-Ende**: Bei Server 2022 endet Mainstream 2026, aber Sicherheitsupdates gibt es bis 2031.
- ESU ist **kein** neuer Support, sondern **teure Übergangslösung**.
- Ein **isoliertes** Altsystem ist weniger gefährlich, aber **nicht sicher**.

## Grafik
### Lebenszyklus-Zeitstrahl
Ein Zeitstrahl von der Veröffentlichung bis zum Ende: erste 5 Jahre grün („Mainstream“, Zahnrad und Schild), nächste 5 Jahre gelb („Extended“, nur Schild), danach rot („Ende“, Schild bricht), daneben eine kleine goldene Verlängerung „ESU“. Klick auf ein Produkt (Server 2012, 2016, 2019, 2022, 2025) zeigt seine Daten.

### Schulbus-Vergleich
Ein alter Bus mit blinkenden Warnlampen; per Schalter wird er „isoliert“ (Bus fährt in ein abgezäunte Straße) oder „ersetzt“ (neuer Bus rollt herein).

## Karteikarten
- F: Was bedeutet Legacy in der IT? | A: Veraltete, noch genutzte Technik, die überholt ist, oft ohne Updates und durch bessere Verfahren ersetzt.
- F: Was gilt im Mainstream Support? | A: Sicherheits- und Funktionsupdates sowie Fehlerkorrekturen.
- F: Was gilt im Extended Support? | A: Nur noch Sicherheitsupdates, keine neuen Funktionen.
- F: Was passiert nach Ende des Supports (EOS)? | A: Keine Updates mehr, neue Sicherheitslücken bleiben offen.
- F: Was ist ESU? | A: Kostenpflichtige Extended Security Updates für einige Jahre nach EOS.
- F: Wie lange laufen Mainstream und Extended bei Windows Server LTSC? | A: Je 5 Jahre.
- F: Wann endete der Support für Windows Server 2012 R2 (Extended)? | A: 10.10.2023.
- F: Wann endet der Extended Support für Windows Server 2022? | A: 14.10.2031.
- F: Wann endet der Extended Support für Windows Server 2025? | A: 10.11.2034.
- F: Nenne drei Risiken von Legacy. | A: Keine Patches, schwache Kryptografie, Compliance-Verstoß (auch Sprungbrett für Angreifer).
- F: Welche Lücke traf 2017 unpatchte SMB1-Systeme? | A: EternalBlue (WannaCry).
- F: Was ist der erste Schritt im Umgang mit Legacy? | A: Inventarisieren und Risiko bewerten.

## Quiz
? Was bekommen Systeme im Extended Support?
* Nur noch Sicherheitsupdates
- Sicherheits- und Funktionsupdates
- Keine Updates
- Nur Treiberupdates

? Wie lange dauert bei Windows Server LTSC der Mainstream Support?
* 5 Jahre
- 3 Jahre
- 10 Jahre
- 7 Jahre

? Was ist ESU?
* Kostenpflichtige Sicherheitsupdates nach Support-Ende
- Ein kostenloses Funktionsupdate
- Ein Windows-Server-Rollenname
- Eine Verschlüsselungsart

? Server 2022 hat 2026 das Ende des Mainstream-Supports. Was heißt das?
* Es gibt weiter Sicherheitsupdates bis 2031
- Es gibt sofort keine Updates mehr
- Der Server darf nicht mehr betrieben werden
- Die Lizenz läuft ab

? Welche Maßnahme passt zuerst zu einem unvermeidbaren Altsystem?
* Isolieren (eigenes VLAN, Firewall) und Ersatz planen
- Im Produktivnetz lassen, ohne Änderung
- Alle Updates deaktivieren
- Passwort auf 4 Zeichen kürzen
