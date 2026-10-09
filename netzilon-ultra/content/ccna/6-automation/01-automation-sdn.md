---
id: ccna-automation-sdn
bereich: CCNA
block: CCNA 6.1 – 6.7
kapitel: Automation and Programmability
titel: Netzwerk-Automatisierung – SDN, Controller, REST-API, JSON, Ansible, Terraform
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, 200-301.pdf]
verweise: [ccna-architekturen, ccna-virtualisierung-cloud, ccna-cli-grundlagen, ccna-ssh-ftp-tftp]
---

## Profi

### Warum Automatisierung?
Manuelle CLI-Konfiguration pro Gerät ist langsam, fehleranfällig und führt zu **Configuration Drift** (Geräte weichen vom Soll ab). Automatisierung bringt Geschwindigkeit, Konsistenz, Wiederholbarkeit, Dokumentation und Skalierung.

### Ebenen eines Netzes
- **Management Plane**: Verwaltung (SSH, SNMP, NETCONF, REST).
- **Control Plane**: Entscheidungen (Routing-Protokolle, STP, ARP, OSPF → baut Routing-/MAC-Tabellen).
- **Data Plane (Forwarding Plane)**: Weiterleiten der Pakete (Switching, Routing, NAT, ACL-Filter), Hardware (ASIC/CEF).
Traditionell sind Control- und Data Plane **im Gerät** verteilt.

### SDN – Software-Defined Networking
Trennt die **Control Plane** von der Data Plane und zentralisiert sie in einem **SDN-Controller**.
- **Northbound API** (Controller ↔ Anwendungen; meist **REST**).
- **Southbound API** (Controller ↔ Geräte; OpenFlow, NETCONF, RESTCONF, SNMP, CLI/SSH, OpFlex).
- Cisco-Lösungen: **Catalyst Center** (früher DNA Center) für Campus (**Intent-Based Networking**, Assurance, Fabric), SD-WAN (vManage), ACI im Rechenzentrum.
- **Overlay** (VXLAN, Tunnel) auf **Underlay** (physisches IP-Netz); **Fabric** (SD-Access) = Overlay + Underlay + Controller.

### REST-API
**REST** (Representational State Transfer) über HTTP/HTTPS. Merkmale: zustandslos, Ressourcen-URIs, Standardmethoden.
| HTTP | CRUD | Zweck |
|---|---|---|
| **POST** | Create | anlegen |
| **GET** | Read | lesen |
| **PUT / PATCH** | Update | ersetzen / teilweise ändern |
| **DELETE** | Delete | löschen |
Statuscodes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error. Format: **JSON** (häufig), XML, YAML. Authentifizierung per Token (Bearer), Basic Auth, API-Key.
URI: `https://host/api/v1/devices?limit=10` (Schema, Host, Pfad, Query). **RESTCONF** (HTTP, YANG-Datenmodelle), **NETCONF** (SSH TCP 830, XML).

### Datenformate
**JSON**: Schlüssel/Wert-Paare in `{}`, Listen in `[]`, Strings in "", Zahlen, true/false/null.
```
{"interface": {"name": "G0/1", "enabled": true, "ip": ["10.0.0.1/24"]}}
```
**XML** (Tags), **YAML** (Einrückung, Ansible-Playbooks), **YANG** (Datenmodellierungssprache).

### Konfigurations-Management-Tools
| Tool | Merkmal |
|---|---|
| **Ansible** | agentenlos (SSH), **Push**, YAML-Playbooks, Inventory, idempotent |
| **Puppet** | agentenbasiert, **Pull**, deklarativ (Manifests) |
| **Chef** | agentenbasiert, Pull, Ruby (Recipes/Cookbooks) |
| **Terraform** | Infrastructure as Code (HCL), Provisionierung, Zustandsdatei |
**Idempotenz**: gleiches Playbook mehrfach ausführen = gleiches Ergebnis. **Deklarativ** („so soll es sein“) vs. **imperativ** („tue folgende Schritte“).

### KI und Automatisierung
Predictive Analytics, Machine Learning für Anomalieerkennung (Assurance); generative KI unterstützt Konfig. – prüfen vor Einsatz.

## Einfach

Stell dir vor, du musst in 200 Klassenzimmern denselben Satz an die Tafel schreiben. Du könntest 200-mal hinlaufen – oder du schickst **einen Roboter**, der es in jedem Zimmer macht. **Automatisierung** heißt: Der Roboter macht die langweilige Arbeit, und du schreibst nur einmal die Anleitung. Der Vorteil: keine Tippfehler, alle Zimmer gleich, schnell fertig.

Ein Netzwerk besteht aus drei „Etagen“:
- **Management**: Wer verwaltet das Gerät?
- **Control**: Wer entscheidet, wohin ein Paket muss (Landkarte)?
- **Data**: Wer fährt das Paket tatsächlich weiter (der Lieferwagen)?
Früher hatte **jedes Gerät sein eigenes kleines Gehirn**. Bei **SDN** gibt es ein **großes gemeinsames Gehirn (Controller)**, die Geräte sind nur noch die Lieferwagen.

Mit dem Controller sprichst du über eine **API**, wie ein Kellner in einem Restaurant: Du bestellst (GET: „Gib mir die Liste“, POST: „Lege neu an“, PUT: „Ändere“, DELETE: „Lösche“), der Kellner bringt dir das Essen (die Antwort) in einer genormten Schachtel, meist **JSON**. JSON sieht aus wie ein Steckbrief: `{"name": "Switch1", "ports": 24}`. Der Statuscode ist die Rückmeldung des Kellners: **200** = „Alles gut“, **404** = „Gibt es nicht“, **401** = „Wer sind Sie?“.

Werkzeuge wie **Ansible** sind wie Rezeptbücher: Du schreibst das Rezept einmal auf (YAML), und der Koch führt es auf allen Geräten aus – auch zehnmal, ohne dass das Ergebnis anders wird.

## Merksatz
- **SDN: Control Plane zentral (Controller), Data Plane bleibt am Gerät.**
- **North = Apps (REST), South = Geräte (NETCONF/OpenFlow).**
- **REST: POST create, GET read, PUT update, DELETE delete.**
- **JSON `{}` Objekt, `[]` Liste.**
- **Ansible: agentenlos, Push, YAML. Puppet/Chef: Agent, Pull.**
- **200 OK, 201 Created, 401, 403, 404.**

## Prüfungsfalle
- **Control Plane ≠ Data Plane**: Control entscheidet (Tabellen füllen), Data leitet weiter.
- **Northbound = Richtung Anwendungen**, Southbound = Richtung Geräte.
- **POST** legt neu an, **PUT** ersetzt/aktualisiert – nicht vertauschen.
- **401 Unauthorized** (nicht authentifiziert) vs. **403 Forbidden** (kein Recht).
- **Ansible nutzt SSH ohne Agent**; Puppet/Chef brauchen einen Agent.
- **Terraform** provisioniert Infrastruktur (IaC), Ansible konfiguriert.
- **JSON** kennt keine Kommentare; Zeichenketten in doppelten Anführungszeichen.
- **YAML** arbeitet mit Einrückung (keine Tabs).

## Grafik
### SDN-Architektur
1. Anwendung -> Controller: Northbound REST: "VLAN 30 überall anlegen"
2. Controller: Policy in Gerätekonfig übersetzen
3. Controller -> Switch1: Southbound NETCONF
4. Controller -> Switch2: Southbound NETCONF
5. Switch1: Data Plane leitet Pakete weiter

### REST-Aufruf
1. Skript -> Catalyst Center: POST /auth/token (Benutzer)
2. Catalyst Center -> Skript: 200 OK, Token
3. Skript -> Catalyst Center: GET /network-device (Header Token)
4. Catalyst Center -> Skript: 200 OK, JSON mit Geräteliste

## Lab
**Windows PC oder Linux: Python/curl gegen eine Sandbox-API (DevNet) – Konzept ohne echte Zugangsdaten**

### Cisco IOS
```
R1(config)# ip http secure-server
R1(config)# restconf
R1# show running-config | include restconf
```
Anschließend vom PC (Linux/WSL):
```
curl -k -u admin:LABPASS -H "Accept: application/yang-data+json" https://192.168.1.1/restconf/data/ietf-interfaces:interfaces
```
Ansible-Beispiel (Linux, `playbook.yml`):
```
- hosts: switches
  gather_facts: no
  tasks:
    - cisco.ios.ios_vlans:
        config:
          - vlan_id: 30
            name: GAST
        state: merged
```
Aufruf: `ansible-playbook -i inventory.ini playbook.yml`. Kontrolle: `show vlan brief` – zweiter Lauf ändert nichts (Idempotenz). Passwörter nur im Lab.

## Befehle
- `restconf` – RESTCONF aktivieren
- `curl -X GET URL` – REST-GET
- `ansible-playbook playbook.yml` – Playbook ausführen
- `terraform apply` – Infrastruktur bereitstellen
- `show running-config | include restconf` – Prüfung

## Übungen
- A: Welche Plane trifft Weiterleitungsentscheidungen? | L: Control Plane; die Data Plane führt sie aus.
- A: Welche HTTP-Methode legt eine Ressource an? | L: POST.
- A: Was ist Northbound/Southbound? | L: Northbound: Controller ↔ Anwendungen (REST); Southbound: Controller ↔ Geräte (NETCONF, OpenFlow).
- A: Was bedeutet 404? | L: Ressource nicht gefunden.
- A: Ansible vs. Puppet? | L: Ansible agentenlos/Push/YAML, Puppet agentenbasiert/Pull.
- A: Schreiben Sie ein JSON-Objekt für Switch "SW1" mit 24 Ports. | L: {"name": "SW1", "ports": 24}

## Karteikarten
- F: Was ist SDN? | A: Trennung von Control und Data Plane mit zentralem Controller.
- F: Was ist die Data Plane? | A: Weiterleiten der Pakete (Forwarding).
- F: Was ist die Control Plane? | A: Aufbau von Tabellen und Entscheidungen (Routing, STP).
- F: REST-Methoden CRUD? | A: POST, GET, PUT/PATCH, DELETE.
- F: Statuscode 200? | A: OK.
- F: Statuscode 401? | A: Nicht authentifiziert.
- F: JSON-Objekt Klammern? | A: Geschweifte Klammern.
- F: Ansible-Format? | A: YAML-Playbooks, agentenlos über SSH.
- F: Was ist Idempotenz? | A: Mehrfaches Ausführen liefert dasselbe Ergebnis.
- F: Catalyst Center? | A: Cisco-Controller für Campus-Automatisierung (früher DNA Center).
- F: NETCONF-Port? | A: TCP 830 (SSH).

## Quiz
? Welche Plane leitet Pakete weiter?
* Data Plane
- Control Plane
- Management Plane
- Service Plane
? Welche HTTP-Methode liest Daten?
* GET
- POST
- PUT
- DELETE
? Was ist die Northbound API?
* Schnittstelle zwischen Controller und Anwendung
- Schnittstelle zwischen Controller und Geräten
- Eine Konsolenverbindung
- Ein Routing-Protokoll
? Welches Tool nutzt SSH ohne Agent?
* Ansible
- Puppet
- Chef
- SaltStack-Minion
? Welcher Statuscode bedeutet „nicht gefunden“?
* 404
- 200
- 401
- 500
? Wie wird ein JSON-Objekt begrenzt?
* Mit {}
- Mit []
- Mit <>
- Mit ()
? Wofür steht SDN?
* Software-Defined Networking
- System Data Network
- Secure Data Node
- Switched Domain Network
? Was beschreibt Idempotenz?
* Gleiches Ergebnis bei Wiederholung
- Schnelle Ausführung
- Verschlüsselung
- Zufällige Ergebnisse
? Welche Sprache nutzt Terraform?
* HCL
- Ruby
- XML
- Perl
