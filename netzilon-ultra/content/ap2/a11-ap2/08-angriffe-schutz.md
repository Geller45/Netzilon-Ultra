---
id: ap2-angriffe-schutz
bereich: AP2
block: A11
kapitel: IT-Sicherheit
titel: Angriffe und Schutzmaßnahmen (Malware, Phishing, DDoS, Firewall, DMZ, IDS/IPS)
stufe: Fortgeschritten
quellen: [BSI Lagebericht, IHK-Prüfungskatalog]
verweise: [ap2-it-sicherheit, ap2-kryptografie, ap2-netzwerk-design, ap2-backup-speicher]
---

## Profi

### Schadsoftware
| Typ | Merkmal |
|---|---|
| **Virus** | **Hängt sich an Datei**, braucht **Wirt + Ausführung** |
| **Wurm** | **Verbreitet sich selbst** übers Netz |
| **Trojaner** | **Tarnt sich als nützliches Programm** |
| **Ransomware** | **Verschlüsselt Daten**, **Lösegeld**, oft **Double Extortion** (Daten zusätzlich abgezogen) |
| **Spyware/Keylogger** | **Spioniert/zeichnet Eingaben auf** |
| **Rootkit** | **Versteckt sich tief im System** |
| **Botnet** | **Ferngesteuerte Rechner** (für DDoS, Spam) |
| **Backdoor** | **Heimlicher Zugang** |

### Angriffe
| Angriff | Beschreibung | Schutz |
|---|---|---|
| **Phishing / Spear-Phishing** | **Gefälschte E-Mails/Seiten**, gezielt auf Person | **Schulung, MFA, SPF/DKIM/DMARC, Mailfilter** |
| **Social Engineering** | **Menschen manipulieren** (CEO-Fraud, Pretexting) | **Awareness, Rückruf-Verfahren** |
| **DoS/DDoS** | **Überlastung** | **Rate Limiting, DDoS-Schutz des Providers, CDN** |
| **Man-in-the-Middle** | **Abhören/Verändern** | **TLS, Zertifikatsprüfung, VPN** |
| **ARP-Spoofing** | **Falsche MAC-Zuordnung** im LAN | **Dynamic ARP Inspection, 802.1X** |
| **DNS-Spoofing** | **Falsche Namensauflösung** | **DNSSEC** |
| **Brute Force / Credential Stuffing** | **Passwörter durchprobieren / geleakte nutzen** | **Kontosperre, MFA, lange Passwörter** |
| **SQL-Injection** | **SQL-Code in Eingabefeld** | **Prepared Statements**, **Eingabevalidierung** |
| **XSS** | **Skript in Webseite eingeschleust** | **Ausgabe maskieren/escapen, CSP** |
| **Zero-Day** | **Unbekannte Lücke** | **Schnell patchen, Segmentierung, EDR** |
| **Supply-Chain** | **Über Lieferant/Update** | **Signaturen prüfen, Lieferantenmanagement** |
| **Pass-the-Hash** | **Hash statt Passwort** | **Credential Guard, LAPS, Tiering** |

### Firewall-Typen
| Typ | Arbeitet auf | Merkmal |
|---|---|---|
| **Paketfilter (stateless)** | **Schicht 3/4** | **IP, Port, Protokoll** |
| **Stateful Inspection** | **Schicht 3/4 + Verbindungszustand** | **Antworten automatisch erlaubt** |
| **Application-Level-Gateway / Proxy** | **Schicht 7** | **Inhalte prüfen** |
| **NGFW** | **Bis Schicht 7** | **Anwendungserkennung, IPS, TLS-Inspektion** |
| **WAF** | **HTTP** | **Schutz vor SQLi/XSS** |
| **Personal/Host-Firewall** | **Endgerät** | Windows Defender Firewall |

**Regel-Prinzip**: **Default Deny** (alles verboten, nur Nötiges erlaubt), **Regeln von oben nach unten**, **erste passende gilt**.

### DMZ
**Demilitarisierte Zone** = **eigenes Netz** für **öffentlich erreichbare Server** (Web, Mail, Reverse Proxy).
- **Einstufig** (3-Bein-Firewall) oder **zweistufig** (**zwei Firewalls**, möglichst **verschiedener Hersteller**).
- **Internet → DMZ** erlaubt (nur Dienste), **DMZ → LAN** **verboten**/stark eingeschränkt, **LAN → DMZ** erlaubt.

### IDS/IPS
**IDS** (Intrusion **Detection**): **erkennt und meldet**. **IPS** (Intrusion **Prevention**): **erkennt und blockiert** (inline). **Signaturbasiert** vs. **anomaliebasiert**. **HIDS/NIDS** (Host/Netzwerk). Weitere: **SIEM** (zentrale Log-Auswertung), **EDR/XDR** (Endpoint Detection and Response), **Honeypot**, **SOC**.

### Weitere Schutzmaßnahmen
**Patchmanagement**, **MFA**, **Segmentierung (VLANs)**, **Least Privilege**, **Application Whitelisting**, **E-Mail-Sicherheit** (**SPF, DKIM, DMARC**), **Backups offline/immutable (3-2-1-1-0)**, **Awareness-Schulungen**, **Penetrationstest**, **Schwachstellenscan**, **Passwortrichtlinie** (BSI: **Länge vor Komplexität**, **kein Zwangswechsel ohne Anlass**).

## Einfach
**Virus** braucht **dich zum Starten** (wie Erkältung, die man weitergibt), **Wurm** **krabbelt allein** weiter. **Trojaner** ist **das Holzpferd**: Sieht nett aus, drin sind Angreifer. **Firewall** ist der **Türsteher**, **DMZ** ist der **Vorraum** mit Klingel: Besucher dürfen **rein in den Vorraum**, aber **nicht ins Wohnzimmer**. **IDS** ist die **Alarmanlage**, **IPS** der **Wachmann**, der auch **eingreift**.

## Merksatz
- **Virus braucht Wirt, Wurm nicht**.
- **IDS meldet, IPS blockt**.
- **DMZ → LAN verboten**.
- **Default Deny, erste passende Regel gilt**.
- **SQLi → Prepared Statements**, **XSS → Escapen**.
- **SPF, DKIM, DMARC gegen Mail-Spoofing**.

## Prüfungsfalle
- **Stateful Firewall** erlaubt **Antwortpakete automatisch** – kein eigenes Regelpaar nötig.
- **Regelreihenfolge**: allgemeines „Deny all“ **ganz oben** blockiert alles.
- **IDS verhindert nichts**.
- **Antivirus allein** schützt **nicht vor Phishing**.
- **Backups** müssen **offline/unveränderlich** sein, sonst **mitverschlüsselt**.

## Grafik
### Haus mit Vorraum
Straße (Internet), Vorraum (DMZ) mit Webserver, Wohnzimmer (LAN), zwei Türen (Firewalls).

### Alarmanlage und Wachmann
IDS klingelt, IPS hält den Einbrecher fest.

## Übungen
- A: Webserver soll aus dem Internet erreichbar sein, LAN geschützt. Lösung? | L: Webserver in DMZ, Regeln Internet→DMZ 443 erlaubt, DMZ→LAN verboten.
- A: Login-Formular gibt bei ' OR 1=1 -- alle Daten aus. Angriff und Schutz? | L: SQL-Injection, Prepared Statements.

## Karteikarten
- F: Unterschied Virus und Wurm? | A: Virus braucht Wirt und Ausführung, Wurm verbreitet sich selbst.
- F: Was macht Ransomware? | A: Verschlüsselt Daten und fordert Lösegeld.
- F: Unterschied IDS und IPS? | A: IDS erkennt und meldet, IPS blockiert.
- F: Was ist eine DMZ? | A: Separates Netz für öffentlich erreichbare Server.
- F: Was prüft eine Stateful Firewall zusätzlich? | A: Den Verbindungszustand.
- F: Schutz gegen SQL-Injection? | A: Prepared Statements und Eingabevalidierung.
- F: Wofür DMARC? | A: Richtlinie für Umgang mit SPF/DKIM-Fehlern gegen Mail-Spoofing.
- F: Was ist Spear-Phishing? | A: Gezieltes Phishing gegen bestimmte Personen.
- F: Was ist ein SIEM? | A: Zentrale Sammlung und Korrelation von Sicherheitslogs.

## Quiz
? Welche Schadsoftware verbreitet sich selbstständig über das Netz?
* Wurm
- Virus
- Trojaner
- Rootkit

? Welches System blockiert Angriffe aktiv?
* IPS
- IDS
- SIEM allein
- Honeypot

? Wo steht ein öffentlicher Webserver?
* In der DMZ
- Im internen LAN
- Im Management-VLAN
- Auf dem DC

? Welche Maßnahme schützt gegen SQL-Injection?
* Prepared Statements
- Längere Passwörter
- RAID 5
- DNSSEC

? Ein Mitarbeiter bekommt eine E-Mail vom „Chef“ mit Überweisungsauftrag. Angriff?
* CEO-Fraud (Social Engineering)
- DDoS
- XSS
- ARP-Spoofing
