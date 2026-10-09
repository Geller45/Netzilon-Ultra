---
id: ccna-ntp-snmp-syslog
bereich: CCNA
block: CCNA 4.2 / 4.4 / 4.5
kapitel: IP Services
titel: NTP, SNMP, Syslog und CDP-Monitoring – Zeit, Überwachung, Protokollierung
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, 200-301.pdf]
verweise: [ccna-dhcp-dns, ccna-ssh-ftp-tftp, ccna-security-grundlagen, ccna-qos]
---

## Profi

### NTP – Network Time Protocol
**NTP** (UDP **123**) synchronisiert Uhren. Zeitgenau müssen Logs, Zertifikate, Kerberos (±5 min), Cluster u. a. sein. **Stratum** gibt den Abstand zur Referenzuhr an: Stratum 0 = Referenzuhr (Atomuhr/GPS), Stratum 1 = direkt verbundener Server, jeder weitere Hop +1 (max. 15; 16 = unsynchronisiert). Modi: **Client/Server**, **Symmetric Active**, **Broadcast/Multicast**; Cisco-Router können `ntp master <stratum>` als eigene Quelle sein.
Konfiguration: `ntp server 10.0.0.5` (Client), `ntp master 3` (Quelle ohne externe Uhr), `clock timezone CET 1`, `clock summer-time CEST recurring`. Absichern: `ntp authenticate`, `ntp authentication-key 1 md5 …`, `ntp trusted-key 1`. Kontrolle: `show ntp status`, `show ntp associations`, `show clock detail`. Ein `*` vor der Association = ausgewählter Server (synchronisiert), `+` = Kandidat.

### Syslog
Zentrale Protokollierung (UDP **514**). Schweregrade **0–7**: 0 **Emergency**, 1 **Alert**, 2 **Critical**, 3 **Error**, 4 **Warning**, 5 **Notice**, 6 **Informational**, 7 **Debug**. Merkhilfe: „**E**ine **A**lte **C**hefin **E**rwartet **W**eitere **N**eue **I**deen **D**ringend“. Der Level legt die **maximale Nummer** fest, die ausgegeben wird (Level 4 = 0–4). Ziele: Konsole (`logging console`, Standard debugging), Buffer (`logging buffered`), Terminal (`terminal monitor`), Syslog-Server (`logging host 10.0.0.9`), `logging trap warnings`. Zeitstempel: `service timestamps log datetime msec`. Meldungsformat: `%FACILITY-SEVERITY-MNEMONIC: Text`, z. B. `%LINK-3-UPDOWN: Interface g0/0, changed state to up`.

### SNMP
**SNMP** (UDP **161** Anfragen, **162** Traps) überwacht und verwaltet Geräte. Rollen: **NMS** (Network Management Station), **Agent** (Gerät), **MIB** (Management Information Base) mit **OIDs**. Operationen: **Get/GetNext/GetBulk**, **Set**, **Trap/Inform** (Gerät meldet von selbst; Inform mit Bestätigung). Versionen: **v1/v2c** (Community-Strings im Klartext, z. B. `public`/`private`), **v3** (Benutzer, **Authentifizierung + Verschlüsselung**: noAuthNoPriv, authNoPriv, authPriv). Konfiguration v2c: `snmp-server community LABro RO`, `snmp-server host 10.0.0.9 version 2c LABro`, `snmp-server enable traps`. v3: `snmp-server group G v3 priv`, `snmp-server user U G v3 auth sha … priv aes 128 …`.

### CDP/LLDP-Monitoring
Siehe DTP/VTP-Seite: `show cdp neighbors`.

## Einfach

**NTP** ist die **Funkuhr im Klassenzimmer**: Alle stellen ihre Uhr nach der einen großen Uhr an der Wand. Warum? Wenn zwei Geräte unterschiedliche Zeiten haben, kann man bei einem Fehler nicht mehr erkennen, was zuerst passiert ist – und manche Sicherheitsmechanismen (Zertifikate, Kerberos) funktionieren dann gar nicht. Die Uhren haben Stufen (**Stratum**): Je weiter weg von der Atomuhr, desto höher die Stufe.

**Syslog** ist das **Klassenbuch**: Jedes Gerät schreibt auf, was passiert ist („Netzwerkkabel gezogen“, „Anmeldung fehlgeschlagen“) und schickt es an den Lehrer (Syslog-Server). Jeder Eintrag hat eine **Dringlichkeit von 0 bis 7**: 0 ist „Feuer im Haus!“, 7 ist „Nur zum Debuggen“. Wenn du Stufe 4 einstellst, bekommst du alle Einträge von 0 bis 4.

**SNMP** ist der **Hausmeister mit dem Klemmbrett**. Er geht regelmäßig durch alle Räume und fragt jedes Gerät: „Wie ist deine Temperatur? Wie viel Last?“ (Get). Oder ein Gerät ruft von sich aus: „Hilfe, mir wird heiß!“ (Trap). Wer das Klemmbrett haben darf, bestimmt ein Passwort (**Community-String**). Bei der alten Version (v2c) steht das Passwort offen auf dem Klemmbrett; v3 schließt es in einen Safe ein und prüft, wer fragt.

Zusammen sind sie das Frühwarnsystem eines Netzes: Uhr stimmt, Meldungen kommen zentral an, Überwachung zeigt Probleme früh.

## Merksatz
- **NTP 123, Syslog 514, SNMP 161/162.**
- **Syslog-Level: Emergency 0 … Debug 7 – Level n zeigt 0 bis n.**
- **SNMPv3 = Auth + Verschlüsselung, v2c = Klartext.**
- **Stratum: niedriger ist näher an der Referenzuhr.**
- **Trap vom Gerät, Get/Set von der NMS.**

## Prüfungsfalle
- Syslog-Level 7 = **Debug**, nicht 1; höhere Zahl = **mehr** Meldungen.
- **`logging trap warnings`** sendet Level 0–4 (Warning ist 4) – nicht „nur Level 4“.
- SNMP **Community RO/RW**: RW erlaubt Set; v2c-Strings sind **Klartext**.
- **Traps** gehen an UDP **162** (NMS), Abfragen an UDP **161** (Agent).
- NTP-Stratum 16 = **nicht synchronisiert**.
- `ntp master` ohne reale Quelle liefert eine Zeit ohne Genauigkeitsgarantie.
- Zeitzone mit `clock timezone`, NTP liefert UTC.

## Grafik
### NTP-Hierarchie
1. Text: Stratum 0: GPS-/Atomuhr
2. Atomuhr -> Stratum1-Server: Zeitsignal
3. Stratum1-Server -> R1: NTP (Stratum 2)
4. R1 -> SW1: NTP (Stratum 3)
5. SW1: show ntp status – synchronized

### SNMP Trap
1. NMS -> Router: GetRequest (UDP 161) – ifInOctets
2. Router -> NMS: GetResponse
3. Router: Interface fällt aus
4. Router -> NMS: Trap (UDP 162) linkDown

## Lab
**Packet Tracer / GNS3: R1, SW1, Server (NTP, Syslog, SNMP)**

### Cisco IOS
```
R1(config)# ntp master 3
SW1(config)# ntp server 10.0.0.1
SW1(config)# clock timezone CET 1
SW1(config)# service timestamps log datetime msec
SW1(config)# logging host 10.0.0.9
SW1(config)# logging trap informational
SW1(config)# snmp-server community LABro RO
SW1(config)# snmp-server host 10.0.0.9 version 2c LABro
SW1# show ntp associations
SW1# show logging
SW1# show snmp
```
1. Interface auf SW1 `shutdown` – Syslog-Meldung am Server prüfen.
2. NTP-Status prüfen: Stratum 4 auf SW1.
3. Community nur im Lab verwenden.

## Befehle
- `ntp server 10.0.0.1` – NTP-Quelle
- `show ntp status` – Synchronisation, Stratum
- `logging host 10.0.0.9` – Syslog-Server
- `logging trap warnings` – bis Level 4 senden
- `show logging` – Buffer/Level
- `snmp-server community X RO` – v2c Community
- `show snmp` – SNMP-Statistik

## Übungen
- A: Syslog-Level 0 bis 7 mit Namen? | L: Emergency, Alert, Critical, Error, Warning, Notice, Informational, Debug.
- A: Welche Ports nutzt SNMP? | L: UDP 161 (Abfragen), 162 (Traps).
- A: Router mit `logging trap errors` – welche Level werden gesendet? | L: 0–3 (Emergency bis Error).
- A: Stratum 2 – wer ist Upstream? | L: Ein Stratum-1-Server.
- A: Was unterscheidet SNMPv3 von v2c? | L: Authentifizierung und Verschlüsselung (Benutzer statt Community).
- A: Wieso ist NTP für Kerberos wichtig? | L: Tickets sind zeitabhängig; Abweichung > 5 Minuten führt zu Fehlern.

## Karteikarten
- F: NTP-Port? | A: UDP 123.
- F: Syslog-Port? | A: UDP 514.
- F: SNMP-Ports? | A: UDP 161 (Agent), UDP 162 (Traps).
- F: Höchster Syslog-Level? | A: 7 – Debug.
- F: Level 3? | A: Error.
- F: Was bedeutet Stratum? | A: Abstand zur Referenzuhr (0 = Referenz).
- F: Was ist eine MIB? | A: Datenbank der verwaltbaren Objekte mit OIDs.
- F: Trap vs. Get? | A: Trap kommt vom Gerät, Get von der NMS.
- F: Sichere SNMP-Version? | A: v3.
- F: Wie sieht eine Syslog-Meldung aus? | A: %FACILITY-SEVERITY-MNEMONIC: Text

## Quiz
? Welchen UDP-Port nutzt NTP?
* 123
- 53
- 161
- 514
? Welcher Syslog-Level ist Warning?
* 4
- 3
- 5
- 6
? Welche SNMP-Version bietet Verschlüsselung?
* SNMPv3
- SNMPv1
- SNMPv2c
- SNMPv0
? Auf welchem Port werden SNMP-Traps empfangen?
* UDP 162
- UDP 161
- TCP 161
- UDP 514
? Was liefert logging trap warnings?
* Level 0 bis 4
- Nur Level 4
- Level 4 bis 7
- Alle Level
? Stratum 16 bedeutet…
* nicht synchronisiert
- beste Genauigkeit
- Backup-Server
- Referenzuhr
? Welcher Befehl zeigt die NTP-Synchronisation?
* show ntp status
- show clock
- show ntp log
- show timesync
? Was ist eine Community in SNMPv2c?
* Klartext-Passwort für Zugriff
- Ein VLAN
- Ein Cluster
- Ein Zertifikat
? Was ist der Level 1?
* Alert
- Critical
- Notice
- Debug
