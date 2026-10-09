---
id: erg-monitoring-logging
bereich: AP2
block: ERG
kapitel: Ergänzungen 2.2
titel: Monitoring und Logging – SNMP, Syslog, Schwellwerte, Windows-Ereignisse, zentrale Protokollierung
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP1, AP2, Schule]
quellen: [RFC 3411–3418 (SNMPv3), RFC 5424 (Syslog), Microsoft Learn – Ereignisanzeige, Windows-Ereignisweiterleitung, Leistungsüberwachung, BSI IT-Grundschutz OPS.1.1.5 Protokollierung]
verweise: [ap2-itil-monitoring, ccna-ntp-snmp-syslog, az801-ereignisprotokolle, az801-leistungsueberwachung, az801-log-analytics, az800-update-monitoring, linux-102-108-2-logging, linux-l2-16-logging]
---

## Profi

### Warum überwachen?
**Monitoring** erkennt Störungen und Engpässe, **bevor** Anwender sie melden (proaktiv), liefert Nachweise für **SLA-Kennzahlen** (Verfügbarkeit) und Daten für die **Kapazitätsplanung**. **Logging** zeichnet Ereignisse auf – für Fehlersuche, Sicherheit (Angriffserkennung, Forensik) und Nachweispflichten. Werkzeuge: **PRTG**, **Zabbix**, **Checkmk**, **Icinga/Nagios**, Cloud: **Azure Monitor/Log Analytics**; zentrale Logauswertung bzw. **SIEM** (z. B. Microsoft Sentinel, Elastic, Graylog).

### Was wird überwacht?
| Ebene | Beispiele | typische Schwellwerte |
|---|---|---|
| Verfügbarkeit | Ping, Port erreichbar, HTTP-Statuscode 200 | Ausfall > 2 Prüfintervalle |
| Ressourcen | CPU, RAM, Datenträgerbelegung, Netzauslastung | Warnung 80 %, kritisch 90 % |
| Dienste | Windows-Dienste, systemd-Units, Datenbank, Mail-Queue | Dienst gestoppt |
| Hardware | Temperatur, Lüfter, RAID-Status, Netzteil, USV | RAID degraded, USV auf Batterie |
| Sicherheit | fehlgeschlagene Anmeldungen, Kontosperrungen, Änderungen an Admingruppen | Häufung in kurzer Zeit |
| Anwendung | Antwortzeit, Fehlerquote, Zertifikatslaufzeit | Zertifikat < 30 Tage gültig |
Gute Überwachung arbeitet mit **zwei Stufen** (Warnung/kritisch), **Eskalation** und **Benachrichtigung** (Mail, Chat, SMS, Ticket) und vermeidet **Alarmmüdigkeit** durch sinnvolle Schwellwerte und Abhängigkeiten (fällt der Router aus, nicht 50 Folgealarme).

### SNMP
**Simple Network Management Protocol**: Ein **Manager** (Monitoring-Server) fragt **Agenten** auf Geräten ab (**GET**/GETNEXT/GETBULK, **UDP 161**) und kann Werte setzen (**SET**). Agenten senden unaufgefordert **Traps**/Informs an den Manager (**UDP 162**). Die Werte sind in der **MIB** (Management Information Base) als **OIDs** (Object Identifier, z. B. 1.3.6.1.2.1.1.3 = sysUpTime) organisiert.
- **SNMPv1/v2c**: Authentifizierung nur über **Community-String** im Klartext („public“ unbedingt ändern).
- **SNMPv3**: **Benutzer**, **Authentifizierung** (z. B. SHA) und **Verschlüsselung** (z. B. AES) – Sicherheitsstufen noAuthNoPriv, authNoPriv, **authPriv**.

### Syslog
Standardprotokoll für Logmeldungen (RFC 5424), klassisch **UDP 514**, zuverlässig per TCP bzw. verschlüsselt per **TLS (TCP 6514)**. Jede Meldung hat **Facility** (Quelle, z. B. auth, kern, local0–7) und **Severity**:
| Wert | Severity |
|---|---|
| 0 | Emergency |
| 1 | Alert |
| 2 | Critical |
| 3 | Error |
| 4 | Warning |
| 5 | Notice |
| 6 | Informational |
| 7 | Debug |
Merke: **kleine Zahl = schlimm**. Netzwerkgeräte, Firewalls und Linux (rsyslog/journald) senden an einen **zentralen Syslog-Server**. Für korrekte Zeitstempel müssen alle Geräte per **NTP** synchronisiert sein.

### Windows-Ereignisprotokolle
**Ereignisanzeige** (eventvwr.msc) mit den Windows-Protokollen **Anwendung**, **Sicherheit**, **Setup**, **System** und **Weitergeleitete Ereignisse** sowie „Anwendungs- und Dienstprotokolle“. Ebenen: Kritisch, Fehler, Warnung, Information, Ausführlich; im Sicherheitsprotokoll **Überwachung erfolgreich/fehlgeschlagen**. Wichtige IDs: **4624** erfolgreiche Anmeldung, **4625** fehlgeschlagene Anmeldung, **4740** Konto gesperrt, **4720** Benutzer erstellt, **4732** Mitglied einer lokalen Gruppe hinzugefügt, **1074** Herunterfahren durch Prozess/Benutzer, **6008** unerwartetes Herunterfahren, **41** Kernel-Power (Neustart ohne sauberes Herunterfahren). Zentrale Sammlung per **Windows-Ereignisweiterleitung (WEF)**: Quellcomputer → **Sammlercomputer** mit **Abonnement** (Dienst Windows-Ereignissammlung, `wecutil qc`, WinRM). Die **Überwachungsrichtlinien** (Advanced Audit Policy) legen per GPO fest, was überhaupt protokolliert wird. **Leistungsüberwachung** (perfmon) mit **Datensammlersätzen** zeichnet Leistungsindikatoren über Zeit auf.

### Rechtliches
Protokolle mit personenbezogenen Daten (Benutzernamen, IP-Adressen) unterliegen der **DSGVO**: Zweckbindung, Speicherbegrenzung (Löschfristen), Zugriffsschutz; bei Leistungs-/Verhaltenskontrolle der Mitarbeiter hat der **Betriebsrat** ein Mitbestimmungsrecht (§ 87 Abs. 1 Nr. 6 BetrVG).

## Einfach
Monitoring ist wie das **Armaturenbrett im Auto**: Tank, Temperatur, Öl, Geschwindigkeit. Wenn eine Lampe gelb wird, weißt du: „Bald tanken.“ Wird sie rot: „Sofort anhalten!“ Genauso schaut ein Monitoring-Programm ständig auf Server, Switches und Drucker und schlägt Alarm, wenn etwas nicht stimmt – am besten **bevor** jemand anruft.

Dafür fragt der Monitoring-Server die Geräte regelmäßig: „Wie geht's dir? Wie voll ist deine Festplatte?“ Die Sprache dafür heißt oft **SNMP**. Und wenn ein Gerät selbst merkt, dass etwas kaputt ist, ruft es von sich aus: „Hilfe, mein Lüfter ist ausgefallen!“ – das ist ein **Trap**.

**Logging** ist wie ein **Tagebuch** oder die **Blackbox im Flugzeug**: Jedes Gerät schreibt auf, was passiert ist – wer sich angemeldet hat, welcher Fehler aufgetreten ist. Damit man nicht in hundert Tagebüchern suchen muss, schicken alle Geräte ihre Einträge an **einen zentralen Ort**. Ganz wichtig: Alle Uhren müssen gleich gehen (**NTP**), sonst weiß man später nicht, was zuerst passiert ist.

Bei Syslog gibt es eine Wichtigkeits-Skala von 0 bis 7. Aufgepasst: **0 ist der Weltuntergang**, 7 ist nur Geplauder für Entwickler.

Und man darf nicht einfach alles über Mitarbeiter aufschreiben und für immer behalten – dafür gibt es **Datenschutzregeln**, und der Betriebsrat redet mit.

## Merksatz
- **SNMP: Abfrage UDP 161, Trap UDP 162; v3 = Auth + Verschlüsselung.**
- **Syslog: UDP 514, TLS 6514; 0 Emergency … 7 Debug – kleine Zahl = schlimm.**
- **4624 Anmeldung ok, 4625 Anmeldung fehlgeschlagen, 4740 Konto gesperrt.**
- **Warnung 80 %, kritisch 90 % – zwei Stufen statt Alarmflut.**
- **Ohne NTP keine verlässliche Logauswertung.**

## Prüfungsfalle
- **Trap** geht vom **Agenten zum Manager** (Port 162), nicht umgekehrt.
- **SNMPv2c** überträgt den Community-String im **Klartext** – nicht als sicher bezeichnen.
- Bei Syslog bedeutet **Severity 0 das Schwerwiegendste**.
- Ereignis-ID **4625** bedeutet fehlgeschlagene Anmeldung, **nicht** gesperrtes Konto (das ist 4740).
- Logs ohne Löschkonzept verstoßen gegen die **Speicherbegrenzung** der DSGVO.

## Grafik
### SNMP-Abfrage und Trap
1. Monitoring-Server -> Switch: SNMP GET ifInOctets (UDP 161)
2. Switch -> Monitoring-Server: Response mit Zählerwert
3. Monitoring-Server: Berechnet Auslastung – 85 % → Warnung
4. Switch: Netzteil 2 fällt aus
5. Switch -> Monitoring-Server: SNMP Trap (UDP 162)
6. Monitoring-Server -> Admin: Benachrichtigung und Ticket

### Zentrale Protokollierung
1. Firewall -> Syslog-Server: Meldung Severity 4 (Warning)
2. Linux-Server -> Syslog-Server: auth-Meldung „Failed password“
3. Windows-Server -> Sammler: Weitergeleitetes Ereignis 4625
4. Syslog-Server -> SIEM: Korrelation – 50 Fehlversuche in 2 Minuten
5. SIEM -> Security-Team: Alarm „möglicher Brute-Force-Angriff“

## Lab
**Maschinen**: Domänencontroller **DC01**, Sammlerserver **LOG01** (Windows Server 2025) und Client **CL01** im Heimlabor **example.com**; Linux-Server **LX01** (Debian 12).

### GUI
1. **LOG01**: Ereignisanzeige → Abonnements → „Dienst Windows-Ereignissammlung starten“ bestätigen → Neues Abonnement „Anmeldefehler“ → Quellcomputer DC01 hinzufügen → Ereignisse „Sicherheit“, ID 4625 und 4740.
2. **DC01**: Gruppenrichtlinie → Erweiterte Überwachungsrichtlinie → Anmelden/Abmelden → „Anmelden überwachen“ = Erfolg und Fehler.
3. **CL01**: Absichtlich mit falschem Kennwort anmelden (Testkonto).
4. **LOG01**: Weitergeleitete Ereignisse → Ereignis 4625 prüfen (Konto, Quell-IP, Fehlercode).
5. **LOG01**: Leistungsüberwachung → Datensammlersätze → Benutzerdefiniert → Prozessorzeit und freier Speicherplatz alle 15 s aufzeichnen.

### PowerShell
```powershell
# DC01 (Quellcomputer)
winrm quickconfig -quiet
# LOG01 (Sammler)
wecutil qc /q
Get-WinEvent -LogName ForwardedEvents -MaxEvents 10 | Format-Table TimeCreated, Id, MachineName -AutoSize
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625; StartTime=(Get-Date).AddHours(-1)} -ComputerName DC01
Get-Counter '\Prozessor(_Total)\Prozessorzeit (%)' -SampleInterval 5 -MaxSamples 3
```

### CLI (LX01)
```bash
# rsyslog: alles ab Severity warning per TCP an den zentralen Server senden
echo '*.warning @@log01.example.com:514' | sudo tee /etc/rsyslog.d/90-zentral.conf
sudo systemctl restart rsyslog
logger -p auth.warning "Testmeldung von LX01"
journalctl -p warning -n 20 --no-pager
```

## Legende
### SNMP-Trap
- Was: Unaufgeforderte Meldung eines SNMP-Agenten an den Manager.
- Wie: Agent sendet bei einem Ereignis ein Paket an UDP-Port 162 des Managers (Inform = mit Bestätigung).
- Wann: Bei Zustandsänderungen wie Link down, Lüfter-/Netzteilausfall, Temperaturalarm.
- Wo: Switches, Router, USV, Drucker, Server-Management-Controller.
- Warum: Sofortige Benachrichtigung ohne auf das nächste Abfrageintervall zu warten.

### Windows-Ereignisweiterleitung (WEF)
- Was: Bordmittel zum zentralen Sammeln von Windows-Ereignissen.
- Wie: Abonnement auf dem Sammler (wecutil), Quellcomputer senden per WinRM; Auswahl per Ereignis-ID/Protokoll.
- Wann: Wenn sicherheitsrelevante Ereignisse vieler Server/Clients zentral ausgewertet werden sollen.
- Wo: Sammlercomputer mit Protokoll „Weitergeleitete Ereignisse“, Konfiguration per GPO.
- Warum: Angriffe und Fehler werden auch dann sichtbar, wenn ein Angreifer lokale Logs löscht.

## Karteikarten
- F: Welche Ports nutzt SNMP? | A: UDP 161 für Abfragen (GET/SET) an den Agenten, UDP 162 für Traps an den Manager.
- F: Was unterscheidet SNMPv3 von v2c? | A: v3 bietet Benutzer-Authentifizierung und Verschlüsselung; v2c nur Community-Strings im Klartext.
- F: Was ist eine MIB? | A: Management Information Base – hierarchische Beschreibung der abfragbaren Werte (OIDs) eines Geräts.
- F: Welche Severity hat bei Syslog die höchste Dringlichkeit? | A: 0 – Emergency.
- F: Welchen Port nutzt Syslog standardmäßig? | A: UDP 514 (TLS-gesichert TCP 6514).
- F: Was bedeuten die Ereignis-IDs 4624, 4625 und 4740? | A: Erfolgreiche Anmeldung, fehlgeschlagene Anmeldung, Benutzerkonto gesperrt.
- F: Warum ist NTP für Logging wichtig? | A: Nur mit synchronen Uhren lassen sich Ereignisse verschiedener Systeme in die richtige Reihenfolge bringen.
- F: Was ist ein SIEM? | A: Security Information and Event Management – sammelt und korreliert Logs, erkennt Angriffsmuster und alarmiert.
- F: Wozu dienen zwei Schwellwerte (Warnung/kritisch)? | A: Frühzeitig reagieren können, ohne bei jeder Spitze sofort einen kritischen Alarm auszulösen.
- F: Welches Werkzeug zeichnet unter Windows Leistungsindikatoren über längere Zeit auf? | A: Die Leistungsüberwachung (perfmon) mit Datensammlersätzen.

## Quiz
? Über welchen Port sendet ein SNMP-Agent einen Trap an den Manager?
* UDP 162
- UDP 161
- TCP 443
- UDP 514
! 161 wird für Abfragen an den Agenten verwendet.

? Welche SNMP-Version bietet Authentifizierung und Verschlüsselung?
* SNMPv3
- SNMPv1
- SNMPv2c
- Alle Versionen gleichermaßen
! v1/v2c kennen nur Community-Strings im Klartext.

? Welche Syslog-Severity ist am kritischsten?
* 0 – Emergency
- 7 – Debug
- 4 – Warning
- 3 – Error
! Kleine Zahl = schwerwiegend.

? Welche Ereignis-ID protokolliert Windows bei einer fehlgeschlagenen Anmeldung?
* 4625
- 4624
- 4740
- 1074
! 4740 = Konto gesperrt, 4624 = erfolgreiche Anmeldung.

? Warum sollten alle Geräte ihre Uhrzeit per NTP synchronisieren?
* Damit Logeinträge verschiedener Systeme korrekt korreliert werden können
- Damit SNMP schneller antwortet
- Damit die USV länger hält
- Damit DHCP-Leases länger gültig sind
! Auch Kerberos benötigt synchrone Zeit (max. 5 Minuten Abweichung).

? Was ist ein sinnvoller Schwellwert für die Datenträgerbelegung?
* Warnung bei 80 %, kritisch bei 90 %
- Alarm erst bei 100 %
- Alarm bei jeder Änderung
- Kein Schwellwert nötig
! Zwei Stufen geben Zeit zum Reagieren und vermeiden Alarmmüdigkeit.

? Mit welchem Windows-Bordmittel werden Ereignisse mehrerer Server zentral gesammelt?
* Windows-Ereignisweiterleitung mit Abonnements
- Aufgabenplanung
- Datenträgerverwaltung
- Windows Update
! Konfiguration mit wecutil auf dem Sammler und WinRM auf den Quellen.

? Welche Aussage zur Protokollierung personenbezogener Daten ist richtig?
* Es gelten Zweckbindung und Löschfristen nach DSGVO; der Betriebsrat ist bei Verhaltenskontrolle zu beteiligen.
- Logs dürfen unbegrenzt gespeichert werden.
- Logs sind keine personenbezogenen Daten.
- Nur Papierprotokolle unterliegen dem Datenschutz.
! § 87 Abs. 1 Nr. 6 BetrVG – Mitbestimmung bei technischen Überwachungseinrichtungen.

? Welcher Ansatz verhindert eine Alarmflut, wenn ein zentraler Router ausfällt?
* Abhängigkeiten im Monitoring definieren (Parent/Child)
- Alle Alarme abschalten
- Prüfintervall auf 1 Sekunde setzen
- Nur noch per Ping überwachen
! Folgealarme hinter dem Router werden unterdrückt.

## Lücken
- SNMP-Abfragen gehen an UDP-Port {161}, Traps an UDP-Port {162}.
- Syslog nutzt standardmäßig UDP-Port {514}.
- Die Syslog-Severity {0} steht für Emergency.
- Eine fehlgeschlagene Windows-Anmeldung hat die Ereignis-ID {4625}.
- Für korrekte Zeitstempel werden alle Systeme per {NTP} synchronisiert.

## Zuordnen
### Ereignis-ID und Bedeutung
- 4624 => erfolgreiche Anmeldung
- 4625 => fehlgeschlagene Anmeldung
- 4740 => Benutzerkonto gesperrt
- 4720 => Benutzerkonto erstellt
- 41 (Kernel-Power) => Neustart ohne sauberes Herunterfahren

### Syslog-Severity und Name
- 0 => Emergency
- 2 => Critical
- 3 => Error
- 4 => Warning
- 7 => Debug

### SNMP-Begriff und Bedeutung
- Manager => fragt Werte ab und empfängt Traps
- Agent => läuft auf dem überwachten Gerät
- MIB/OID => Struktur und Adresse eines Messwerts
- Trap => unaufgeforderte Meldung des Agenten
- Community-String => einfaches Kennwort bei v1/v2c

## Reihenfolge
### Monitoring einführen
1. Zu überwachende Systeme und Services festlegen
2. Kennzahlen und Schwellwerte definieren
3. Agenten bzw. SNMPv3 auf den Geräten konfigurieren
4. Abhängigkeiten und Benachrichtigungen einrichten
5. Alarme testen und dokumentieren
6. Schwellwerte regelmäßig anpassen

### Windows-Ereignisweiterleitung einrichten
1. WinRM auf den Quellcomputern aktivieren
2. Sammlerdienst mit wecutil qc konfigurieren
3. Abonnement mit Quellcomputern und Ereignisfilter anlegen
4. Überwachungsrichtlinie per GPO aktivieren
5. Weitergeleitete Ereignisse auf dem Sammler prüfen

### Brute-Force-Verdacht prüfen
1. Alarm im SIEM bzw. Häufung von 4625 erkennen
2. Betroffene Konten und Quell-IP ermitteln
3. Kontosperrungen (4740) prüfen
4. Quell-IP sperren bzw. Gerät isolieren
5. Vorfall dokumentieren und Maßnahmen ableiten

## Freitext
- F: Erläutern Sie den Unterschied zwischen Polling (SNMP GET) und Traps. | M: Polling: Manager fragt in festen Intervallen Werte ab (UDP 161) – regelmäßige Messwerte, Verzögerung bis zum nächsten Intervall. Trap: Agent meldet ein Ereignis sofort von sich aus (UDP 162) – schnelle Reaktion, aber unbestätigt (außer Inform). | P: 4
- F: Nennen Sie vier Kennzahlen, die bei einem Dateiserver überwacht werden sollten, mit sinnvollem Schwellwert. | M: Freier Speicherplatz (Warnung < 20 %, kritisch < 10 %), CPU-Auslastung (> 85 % über 10 min), RAM-Auslastung, Datenträgerwarteschlange/Latenz, Dienst „Server“ (LanmanServer) läuft, RAID-Status, Sicherung erfolgreich. | P: 4
- F: Begründen Sie, warum Protokolle zentral gesammelt werden sollten. | M: Gesamtüberblick und Korrelation über Systeme, Schutz vor Manipulation/Löschung durch Angreifer auf dem Quellsystem, einheitliche Aufbewahrung und Auswertung, Alarmierung, Nachweis/Compliance. | P: 3

## Szenario
### Festplatte voll am Monatsende
Der Buchhaltungsserver fiel am Monatsende aus, weil Laufwerk D: voll war. Niemand wurde vorher gewarnt.
- F: Welche Überwachung hätte das verhindert? | A: Überwachung des freien Speicherplatzes mit Warnung (z. B. 80 % belegt) und kritischem Schwellwert (90 %) plus Benachrichtigung/Ticket. | P: 2
- F: Welche weitere Auswertung ist sinnvoll? | A: Trendanalyse/Kapazitätsplanung: Wachstum pro Monat ermitteln und rechtzeitig erweitern oder bereinigen. | P: 2

### Viele fehlgeschlagene Anmeldungen
Auf DC01 erscheinen innerhalb von 5 Minuten 300 Ereignisse 4625 für verschiedene Benutzernamen von derselben IP-Adresse 10.0.20.77.
- F: Was deutet das an? | A: Einen Passwort-Spraying- bzw. Brute-Force-Angriff von einem Gerät im internen Netz. | P: 2
- F: Welche Schritte unternehmen Sie? | A: Gerät 10.0.20.77 identifizieren und isolieren, betroffene Konten/Sperrungen (4740) prüfen, Sicherheitsvorfall eskalieren, Logs sichern, Ursache (Malware) untersuchen. | P: 4

### Unsicheres SNMP
Ein Audit stellt fest, dass alle Switches SNMPv2c mit Community „public“ und Schreibrechten verwenden.
- F: Welche Risiken bestehen? | A: Jeder im Netz kann Konfigurationsdaten auslesen und per SET ändern; Community wird im Klartext übertragen. | P: 2
- F: Wie härten Sie die Konfiguration? | A: Auf SNMPv3 mit authPriv umstellen, nur Lesezugriff, ACL auf den Monitoring-Server beschränken, Standard-Communities entfernen. | P: 3
