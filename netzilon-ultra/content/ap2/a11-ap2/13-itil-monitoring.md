---
id: ap2-itil-monitoring
bereich: AP2
block: A11
kapitel: IT-Service-Management
titel: ITIL, Ticketsystem, Monitoring (SNMP, Syslog), Fehleranalyse
stufe: Fortgeschritten
quellen: [ITIL 4, IHK-Prüfungskatalog]
verweise: [ap2-vertraege, ap2-netzwerk-design, az801-log-analytics]
---

## Profi

### ITIL 4 (Kernbegriffe)
**Service Value System**, **Service-Wertschöpfungskette**, **34 Praktiken**. Prüfungsrelevant:

| Praktik | Ziel |
|---|---|
| **Incident Management** | **Störung schnell beheben** – **Service wiederherstellen** (Workaround ok) |
| **Problem Management** | **Ursache (Root Cause) finden und dauerhaft beseitigen**; **Known Error**, **Known Error Database (KEDB)** |
| **Change Enablement** | **Änderungen kontrolliert** umsetzen: **Standard** (vorab genehmigt), **Normal** (CAB), **Emergency** |
| **Service Desk** | **SPOC** (Single Point of Contact) für Anwender |
| **Service Request Management** | **Standardanfragen** (Passwort, neuer Zugang) |
| **Service Level Management** | **SLAs** vereinbaren und überwachen |
| **Configuration Management** | **CMDB** mit **Configuration Items (CI)** |
| **Release/Deployment** | Neue Versionen bereitstellen |
| **Continual Improvement** | Ständige Verbesserung |

**Incident ≠ Problem**: Incident = **Ereignis** (Drucker geht nicht), Problem = **Ursache** mehrerer Incidents.

### Priorität
**Priorität = Auswirkung (Impact) × Dringlichkeit (Urgency)**, oft **Matrix P1–P4**.

### Support-Level
| Level | Aufgabe |
|---|---|
| **1st Level** | **Annahme, Erfassung, einfache Lösungen**, Standardanfragen |
| **2nd Level** | **Fachspezialisten** (Server, Netz) |
| **3rd Level** | **Hersteller/Entwickler** |
**Eskalation**: **funktional** (an höheren Level), **hierarchisch** (an Vorgesetzte).

### Ticket-Lebenszyklus
**Erfassen → Kategorisieren → Priorisieren → Diagnose → Eskalieren (falls nötig) → Lösen → Schließen (mit Rückmeldung) → Dokumentieren**.

### Monitoring
| Werkzeug | Zweck |
|---|---|
| **SNMP** | **Geräte abfragen/verwalten** (**Manager ↔ Agent**, **UDP 161**, **Traps UDP 162**, **MIB/OID**). **v1/v2c** Community-String **unsicher**, **v3** mit **Auth + Verschlüsselung** |
| **Syslog** | **Zentrale Logs** (**UDP/TCP 514**, TLS 6514), **Severity 0 (Emergency) bis 7 (Debug)** |
| **ICMP/Ping** | Erreichbarkeit |
| **NetFlow/sFlow** | **Verkehrsanalyse** |
| **Tools** | **Zabbix, Nagios/Icinga, PRTG, Checkmk, Grafana/Prometheus**, Azure Monitor |

**Kennwerte**: **Schwellenwerte (Warnung/Kritisch)**, **Baseline**, **Alarmierung** (Mail, SMS), **Dashboards**, **Kapazitätsplanung**.
**Syslog-Stufen**: 0 Emergency, 1 Alert, 2 Critical, 3 Error, 4 Warning, 5 Notice, 6 Informational, 7 Debug.

### Systematische Fehleranalyse
1. **Problem erfassen** (Symptome, seit wann, wer betroffen, was geändert?).
2. **Hypothese** bilden.
3. **Testen** (**OSI von unten** nach oben oder **Divide and Conquer**).
4. **Lösen**, **prüfen**.
5. **Dokumentieren**, **Ursache beheben (Problem)**.

**Werkzeuge**: `ping`, `tracert/traceroute`, `pathping`, `nslookup/dig`, `ipconfig/ip a`, `arp -a`, `netstat/ss`, `Test-NetConnection`, **Wireshark**, **Kabeltester**, **Ereignisanzeige/journalctl**.

### OSI-Modell (Wiederholung)
| Schicht | Name | Beispiel | Gerät |
|---|---|---|---|
| 7 | Anwendung | HTTP, DNS, SMTP | |
| 6 | Darstellung | TLS (grob), Kodierung | |
| 5 | Sitzung | RPC | |
| 4 | Transport | **TCP, UDP** (Ports) | Firewall (L4) |
| 3 | Vermittlung | **IP, ICMP** | **Router** |
| 2 | Sicherung | **Ethernet, MAC** | **Switch** |
| 1 | Bitübertragung | Kabel, Funk | Hub, Repeater |

## Einfach
**Incident** = **Feuer löschen**, **Problem** = **herausfinden, warum es immer wieder brennt**. **Change** = **Umbau mit Genehmigung**. **Service Desk** = **die eine Telefonnummer**, die alle anrufen. **Monitoring** = **Fieberthermometer** für Server – bevor der Nutzer es merkt, piept es.

## Merksatz
- **Incident: wiederherstellen**, **Problem: Ursache beseitigen**.
- **Priorität = Impact × Urgency**.
- **1st – 2nd – 3rd Level**.
- **SNMP 161, Traps 162, nur v3 sicher**.
- **Syslog 514, 0 = schlimmstes, 7 = Debug**.
- **Fehlersuche von unten nach oben**.

## Prüfungsfalle
- **Workaround** ist **Incident-**, keine **Problem-Lösung**.
- **SNMP v2c** mit Community „public“ – **unsicher**.
- **Trap** geht vom **Agent zum Manager**, **nicht umgekehrt**.
- **Syslog-Level 0** ist **Emergency**, **nicht Debug**.
- **Hierarchische** vs. **funktionale** Eskalation verwechselt.

## Grafik
### Feuerwehr und Detektiv
Feuerwehrmann (Incident), Detektiv mit Lupe (Problem).

### Ticket-Fluss
Anrufer → 1st Level → 2nd Level → 3rd Level, Pfeil zurück zur Lösung.

### Thermometer
Server mit Thermometer und Schwellen gelb/rot.

## Karteikarten
- F: Ziel des Incident Managements? | A: Service schnellstmöglich wiederherstellen.
- F: Ziel des Problem Managements? | A: Ursache finden und dauerhaft beseitigen.
- F: Was ist ein Known Error? | A: Problem mit bekannter Ursache und Workaround.
- F: Was ist eine CMDB? | A: Datenbank mit Konfigurationselementen und Beziehungen.
- F: Wie berechnet sich die Priorität? | A: Aus Auswirkung und Dringlichkeit.
- F: Welche SNMP-Version ist sicher? | A: SNMPv3.
- F: Port für SNMP-Traps? | A: UDP 162.
- F: Syslog-Port? | A: 514.
- F: Was macht der 1st Level Support? | A: Annahme, Erfassung, einfache Lösungen.
- F: Was ist ein Standard-Change? | A: Vorab genehmigte, risikoarme Routineänderung.

## Quiz
? Ein Drucker fällt aus und wird durch einen Ersatz überbrückt. Welche Praktik?
* Incident Management
- Problem Management
- Change Enablement
- Release Management

? Welcher Port empfängt SNMP-Traps?
* UDP 162
- UDP 161
- TCP 514
- TCP 443

? Welche Syslog-Stufe ist die kritischste?
* 0 Emergency
- 7 Debug
- 4 Warning
- 6 Informational

? Wer genehmigt normale Changes?
* Change Advisory Board (CAB)
- Service Desk allein
- Endanwender
- Hersteller

? Auf welcher OSI-Schicht arbeitet ein Router?
* 3
- 2
- 1
- 7

? Was ist ein Problem nach ITIL?
* Die Ursache eines oder mehrerer Incidents
- Jede Benutzeranfrage
- Eine geplante Änderung
- Ein Hardwarekauf
! Problem Management sucht die Ursache, Incident Management stellt den Service wieder her.

? Welche Kennzahl beschreibt die Lösung beim ersten Kontakt?
* First Call Resolution (Erstlösungsquote)
- MTBF
- RPO
- TTL
! Wichtiger KPI des Service Desks.

? Wohin werden Anfragen im Rahmen der funktionalen Eskalation weitergegeben?
* An eine Stelle mit mehr Fachwissen (2nd/3rd Level)
- An die Geschäftsführung
- An den Kunden
- An den Betriebsrat
! Die hierarchische Eskalation geht an höhere Führungsebenen.
