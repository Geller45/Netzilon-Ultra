---
id: ccna-cli-grundlagen
bereich: CCNA
block: CCNA 5.3
kapitel: Network Fundamentals
titel: Cisco-IOS-CLI – Modi, Passwörter, running-config, Grundkonfiguration
stufe: Einsteiger
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf]
verweise: [ref-cisco-ios, ccna-ssh-ftp-tftp, ccna-security-grundlagen, ccna-ipv4-adressierung]
---

## Profi

### Zugang zum Gerät
- **Console-Port** (RJ45 oder USB): Erstkonfiguration mit **Rollover-/Konsolenkabel** (RJ45 ↔ DB9 oder USB). Terminalprogramm (PuTTY, Tera Term) mit **9600 Baud, 8 Datenbits, keine Parität, 1 Stoppbit, keine Flusskontrolle** (9600 8N1).
- **VTY-Lines** (virtuelle Terminals): Fernzugriff per **SSH** (TCP 22) oder Telnet (TCP 23).
- **AUX-Port**: alter Modem-Zugang.

### Modi und Prompts
| Modus | Prompt | Wechsel | Rechte |
|---|---|---|---|
| **User EXEC** | `R1>` | Anmeldung | nur einfache `show`-Befehle, `ping` |
| **Privileged EXEC** | `R1#` | `enable` | alle `show`, `copy`, `reload`, `debug`, `clock set` |
| **Global Configuration** | `R1(config)#` | `configure terminal` | geräteweite Einstellungen |
| Interface Configuration | `R1(config-if)#` | `interface g0/0` | Schnittstelle |
| Subinterface | `R1(config-subif)#` | `interface g0/0.10` | Subinterface (ROAS) |
| Interface Range | `SW1(config-if-range)#` | `interface range f0/1 - 24` | mehrere Ports |
| Line | `R1(config-line)#` | `line console 0` / `line vty 0 15` | Console/VTY |
| Router (Protokoll) | `R1(config-router)#` | `router ospf 1` | Routingprotokoll |
| VLAN | `SW1(config-vlan)#` | `vlan 10` | VLAN-Name |
| Named ACL | `R1(config-std-nacl)#` / `(config-ext-nacl)#` | `ip access-list …` | ACL-Einträge |
| DHCP-Pool | `R1(dhcp-config)#` | `ip dhcp pool LAN` | DHCP-Server |
Zurück: `exit` (eine Ebene), `end` oder **Strg+Z** (direkt nach Privileged EXEC). `do` führt EXEC-Befehle im Konfigurationsmodus aus (`do show ip int brief`).

### Hilfen
- `?` zeigt mögliche Befehle/Parameter; `sh?` zeigt Befehle, die mit „sh“ beginnen.
- **Tab** vervollständigt eindeutige Abkürzungen; Abkürzungen funktionieren, solange eindeutig (`conf t`, `sh run`, `int g0/0`).
- `no …` macht einen Befehl rückgängig; `default interface g0/0` setzt eine Schnittstelle zurück.
- Pfeil hoch / Strg+P: Befehlshistorie.

### Konfigurationsdateien
| Datei | Ort | Bedeutung |
|---|---|---|
| **running-config** | RAM | aktive Konfiguration, jede Eingabe wirkt sofort |
| **startup-config** | NVRAM | wird beim Neustart geladen |
Speichern: `copy running-config startup-config`, `write` oder `write memory`. Löschen: `write erase` bzw. `erase startup-config`, dann `reload`. VLAN-Datenbank liegt bei Switches separat in `flash:vlan.dat`.

### Passwörter
| Befehl | Wirkung | Speicherung |
|---|---|---|
| `enable password X` | Passwort für Privileged EXEC | Klartext (mit `service password-encryption` Typ 7) |
| `enable secret X` | Passwort für Privileged EXEC, **überschreibt** enable password | Hash (Typ 5 MD5, moderne IOS Typ 8 PBKDF2 / **Typ 9 scrypt**) |
| `service password-encryption` | verschlüsselt **alle Klartext-Passwörter** schwach mit **Typ 7** (Vigenère-basiert, leicht knackbar) | betrifft vorhandene und künftige Passwörter; `enable secret` unberührt |
| `no service password-encryption` | künftige Passwörter wieder im Klartext; vorhandene bleiben verschlüsselt | – |
| `username admin secret X` | lokaler Benutzer mit Hash | für `login local` |
| `security passwords min-length 10` | Mindestlänge | – |
Console absichern:
```
R1(config)# line console 0
R1(config-line)# password Konsole1
R1(config-line)# login
R1(config-line)# exec-timeout 5 0
R1(config-line)# logging synchronous
```
Mit `login local` werden stattdessen lokale Benutzernamen abgefragt.

### Grundkonfiguration (Checkliste)
Hostname, Banner, Passwörter, `no ip domain-lookup` (verhindert lange Wartezeit bei Tippfehlern), Interfaces mit IP + `no shutdown`, Beschreibung, speichern.

### Wichtige show-Befehle
`show running-config`, `show startup-config`, `show version` (IOS, Uptime, Config-Register 0x2102), `show ip interface brief`, `show interfaces`, `show flash`, `show history`, `show clock`.

## Einfach

Ein Cisco-Router ist wie ein **Haus mit mehreren Stockwerken**, und mit jedem Stockwerk darfst du mehr:
- **Erdgeschoss (`R1>`)**: Du darfst nur **gucken**, nichts anfassen – wie ein Besucher.
- **1. Stock (`R1#`)**: Mit dem Schlüssel `enable` kommst du hoch. Jetzt darfst du **alles ansehen**, speichern und neu starten – wie der Hausmeister.
- **2. Stock (`R1(config)#`)**: Mit `configure terminal` kommst du in die **Werkstatt**. Hier änderst du Einstellungen für das ganze Haus.
- **Einzelne Zimmer (`R1(config-if)#`)**: Mit `interface` gehst du in ein bestimmtes Zimmer (eine Netzwerkbuchse) und stellst nur dort etwas ein.

Der Prompt (das Zeichen vor dem Cursor) zeigt dir immer, **in welchem Stockwerk du bist**. In der Prüfung ist das super wichtig!

Alles, was du einstellst, steht zuerst nur auf einer **Tafel** (running-config). Schaltest du den Strom ab, ist die Tafel **gelöscht**. Damit es bleibt, musst du es ins **Heft abschreiben**: `copy running-config startup-config`.

Passwörter: `enable secret` ist ein **gutes Schloss** (Hash). `enable password` ist ein **Zettel unter der Fußmatte** – jeder kann ihn lesen. `service password-encryption` schreibt den Zettel nur in einer **leicht knackbaren Geheimschrift**.

## Merksatz
- **> gucken · # Chef · (config)# bauen.**
- **running = RAM = jetzt · startup = NVRAM = nach Neustart.**
- **secret schlägt password.**
- **Typ 7 = schwach, Typ 5/8/9 = Hash.**
- **Nach jeder Änderung: wr!**

## Prüfungsfalle
- `service password-encryption` betrifft **nicht** `enable secret` (das ist schon gehasht).
- Wird `service password-encryption` deaktiviert, werden vorhandene Passwörter **nicht** entschlüsselt.
- Ist `enable secret` gesetzt, wird `enable password` **ignoriert**.
- `login` ohne `password` auf der Line → Zugang **nicht möglich** („Password required, but none set“).
- Änderungen ohne `copy run start` sind nach `reload` **weg**.
- Jeremys Notes: „enable secret will ALWAYS be encrypted (at level 5)“ – auf neueren IOS ist der Standard **Typ 9 (scrypt)** bzw. 8; Typ 5 (MD5) gilt als veraltet.

## Grafik
### Moduswechsel
1. R1: Prompt „R1>“ – User EXEC
2. R1: „enable“ → Prompt „R1#“
3. R1: „configure terminal“ → „R1(config)#“
4. R1: „interface g0/0“ → „R1(config-if)#“
5. R1: „end“ → zurück zu „R1#“
6. R1: „copy run start“ → Konfiguration gespeichert

### running vs. startup
1. Admin -> RAM: Befehl wirkt sofort in running-config
2. RAM -> NVRAM: copy running-config startup-config
3. R1: reload – RAM wird gelöscht
4. NVRAM -> RAM: startup-config wird geladen

## Lab
**Packet Tracer: R1 (ISR 4331), PC1 per Konsolenkabel an Console-Port** (PC1 → Desktop → Terminal, 9600 8N1)

### Cisco IOS
```
Router> enable
Router# configure terminal
Router(config)# hostname R1
R1(config)# no ip domain-lookup
R1(config)# banner motd # Nur fuer autorisierte Benutzer #
R1(config)# enable secret Cisco!2026
R1(config)# service password-encryption
R1(config)# username admin secret Admin!2026
R1(config)# line console 0
R1(config-line)# login local
R1(config-line)# exec-timeout 5 0
R1(config-line)# logging synchronous
R1(config-line)# exit
R1(config)# interface gigabitEthernet0/0/0
R1(config-if)# description ## LAN zu SW1 ##
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# do show ip interface brief
R1(config-if)# end
R1# copy running-config startup-config
R1# show running-config | include secret
```
Prüfen: `show running-config` zeigt `enable secret 9 …` (bzw. 5) und `username admin secret 9 …`.

## Befehle
- `enable` – in den Privileged-EXEC-Modus
- `configure terminal` – in den globalen Konfigurationsmodus
- `hostname R1` – Gerätenamen setzen
- `enable secret PASS` – gehashtes Enable-Passwort
- `service password-encryption` – Klartextpasswörter mit Typ 7 verschleiern
- `line console 0` / `line vty 0 15` – Console- bzw. VTY-Lines konfigurieren
- `login local` – lokale Benutzerdatenbank zur Anmeldung nutzen
- `copy running-config startup-config` – Konfiguration speichern (auch `write`)
- `show running-config` / `show startup-config` – aktive bzw. gespeicherte Konfiguration
- `no ip domain-lookup` – keine DNS-Auflösung bei Tippfehlern
- `do show ip interface brief` – EXEC-Befehl im Config-Modus
- `reload` – Neustart

## Übungen
- A: Ein Admin setzt `enable password cisco` und danach `enable secret class`. Welches Passwort gilt? | L: `class` – enable secret hat Vorrang.
- A: Was passiert nach `no service password-encryption` mit bereits verschlüsselten Passwörtern? | L: Sie bleiben Typ-7-verschlüsselt; nur neue Passwörter werden wieder im Klartext gespeichert.
- A: Welche Terminal-Einstellungen für den Console-Port? | L: 9600 Baud, 8 Datenbits, keine Parität, 1 Stoppbit, keine Flusskontrolle.
- A: Nenne die Reihenfolge der Befehle, um von `R1>` eine IP auf G0/0 zu setzen. | L: enable → configure terminal → interface g0/0 → ip address … → no shutdown.

## Karteikarten
- F: Wie sieht der Prompt im Privileged EXEC aus? | A: R1#
- F: Mit welchem Befehl kommt man in den globalen Konfigurationsmodus? | A: configure terminal (conf t)
- F: Wo liegt die running-config? | A: Im RAM – sie ist die aktive Konfiguration.
- F: Wo liegt die startup-config? | A: Im NVRAM – sie wird beim Booten geladen.
- F: Wie speichert man die Konfiguration? | A: copy running-config startup-config (oder write / write memory).
- F: Was bewirkt service password-encryption? | A: Verschleiert Klartext-Passwörter mit schwachem Typ 7; enable secret bleibt unberührt.
- F: Was hat Vorrang: enable password oder enable secret? | A: enable secret.
- F: Welche Console-Standardeinstellungen gelten? | A: 9600 Baud, 8N1, keine Flusskontrolle.
- F: Wozu dient der do-Befehl? | A: EXEC-Befehle (z. B. show) im Konfigurationsmodus ausführen.
- F: Wie verlässt man jeden Konfigurationsmodus direkt? | A: end oder Strg+Z.
- F: Was macht no ip domain-lookup? | A: Verhindert, dass Tippfehler als Hostname per DNS aufgelöst werden.

## Quiz
? In welchem Modus befindet sich ein Router mit dem Prompt „R1(config-if)#“?
* Interface-Konfigurationsmodus
- Privileged EXEC
- User EXEC
- Line-Konfigurationsmodus

? Welcher Befehl speichert die aktive Konfiguration dauerhaft?
* copy running-config startup-config
- copy startup-config running-config
- save config
- write erase

? Was gilt nach „service password-encryption“?
* Klartext-Passwörter werden mit Typ 7 verschlüsselt, enable secret bleibt unverändert
- Alle Passwörter werden mit AES verschlüsselt
- enable secret wird zusätzlich mit Typ 7 verschlüsselt
- Nur zukünftige Passwörter werden verschlüsselt

? Welche Baudrate nutzt der Cisco-Console-Port standardmäßig?
* 9600
- 115200
- 19200
- 4800

? Wo wird die startup-config gespeichert?
* NVRAM
- RAM
- Flash als vlan.dat
- ROM

? Welcher Befehl erlaubt die Anzeige von show-Ausgaben im Konfigurationsmodus?
* do
- run
- exec
- view

? Ein Admin hat enable password und enable secret gesetzt. Welches Passwort wird abgefragt?
* Das enable secret
- Das enable password
- Beide nacheinander
- Keines, bis reload ausgeführt wurde

? Welcher Befehl wechselt aus jedem Konfigurationsmodus direkt in den Privileged EXEC?
* end
- exit
- disable
- logout

## Lücken
- Der Prompt {R1>} kennzeichnet den User-EXEC-Modus.
- Die aktive Konfiguration heißt {running-config} und liegt im RAM.
- Mit {enable secret} wird ein gehashtes Passwort für den Privileged EXEC gesetzt.
- Der Console-Port arbeitet standardmäßig mit {9600} Baud.

## Reihenfolge
### Router grundkonfigurieren
1. enable
2. configure terminal
3. hostname R1
4. enable secret …
5. interface g0/0 mit ip address und no shutdown
6. end
7. copy running-config startup-config

## Spickzettel
- R1> → enable → R1# → conf t → R1(config)# → int g0/0 → R1(config-if)#
- end/Strg+Z zurück, do show … im Config-Modus
- running = RAM, startup = NVRAM, wr speichert
- enable secret > enable password; Typ 7 schwach
- Console 9600 8N1, line con 0 / line vty 0 15
