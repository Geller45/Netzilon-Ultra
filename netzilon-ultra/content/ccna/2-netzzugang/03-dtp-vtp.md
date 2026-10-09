---
id: ccna-dtp-vtp
bereich: CCNA
block: CCNA 2.2
kapitel: Network Access
titel: DTP, VTP und CDP/LLDP – Trunk-Aushandlung und VLAN-Verteilung
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, 200_301_CCNA_v1.0_2.pdf, VLAN.md]
verweise: [ccna-vlan, ccna-trunk-intervlan, ccna-stp]
---

## Profi

### DTP – Dynamic Trunking Protocol
**DTP** (Cisco-proprietär) handelt zwischen zwei Switch-Ports aus, ob ein Trunk entsteht. Modi:
| Modus | Verhalten |
|---|---|
| `access` | Immer Access, sendet keine DTP-Frames (nach `switchport mode access`) |
| `trunk` | Immer Trunk, sendet weiter DTP-Frames |
| `dynamic desirable` | Versucht aktiv, Trunk aufzubauen |
| `dynamic auto` | Wartet passiv; wird Trunk, wenn die Gegenseite trunk/desirable ist |
Ergebnis-Matrix: trunk/desirable ↔ trunk/desirable/auto = **Trunk**; auto ↔ auto = **Access** (beide warten); access ↔ irgendwas = Access. Standard auf vielen Catalysts: `dynamic auto` (je nach Plattform desirable). Best Practice: Modus **manuell** setzen und DTP mit `switchport nonegotiate` abschalten (nur bei `mode trunk`/`access` erlaubt). Zu Routern, Servern und Endgeräten niemals DTP laufen lassen (Sicherheitsrisiko: Angreifer handelt Trunk aus).

### VTP – VLAN Trunking Protocol
**VTP** (Cisco-proprietär) verteilt die **VLAN-Datenbank** über Trunks. Rollen: **Server** (kann VLANs anlegen/ändern/löschen, speichert Datenbank), **Client** (empfängt, kann nicht ändern), **Transparent** (leitet Updates weiter, nutzt aber nur lokale VLANs), **Off**. Entscheidend ist die **Configuration Revision Number**: Der Switch mit der höheren Revision überschreibt die anderen – ein neu eingesteckter Switch mit höherer Revision und gleicher Domäne kann **alle VLANs im Netz löschen**. Voraussetzungen: gleicher **Domänenname**, gleiches **Passwort**, Trunk-Verbindung. Versionen 1/2/3; nur v3 unterstützt Extended VLANs (1006–4094). In der Praxis wird VTP meist **vermieden** (`vtp mode transparent` oder `off`).

### CDP und LLDP – Nachbarschaftserkennung
- **CDP** (Cisco Discovery Protocol, Layer 2, Cisco-proprietär): Multicast alle 60 s, Hold-Time 180 s; zeigt Nachbar-Gerätename, Port, Plattform, IP. Standardmäßig an.
- **LLDP** (IEEE 802.1AB, herstellerneutral): Timer 30 s, Hold 120 s; standardmäßig bei Cisco **aus** (`lldp run`; pro Port `lldp transmit/receive`).
Befehle: `show cdp neighbors [detail]`, `show lldp neighbors [detail]`, `no cdp run` / `no cdp enable`. Sicherheit: an Außenports abschalten (verrät Infos).

## Einfach

**DTP** ist wie zwei Menschen, die sich an einer Tür treffen und fragen: „Wollen wir die Tür zu einem Mehrfarben-Treppenhaus (Trunk) machen?“ Einer sagt „Ja, unbedingt!“ (desirable), einer sagt „Wenn du willst, gern“ (auto). Wenn beide nur „Wenn du willst“ sagen, passiert nichts – beide warten. Am sichersten ist, **vorher festzulegen**, was die Tür ist, und das Gerede abzuschalten.

**VTP** ist wie ein Rundbrief des Chefs: Der „Server“-Switch schreibt die Liste aller VLANs, und alle anderen Switches im selben Verein (gleicher Domänenname und Passwort) kopieren sie. Gefährlich: Jeder Brief hat eine **Nummer**. Kommt ein Switch mit einer höheren Nummer und einer leeren Liste dazu, denken alle: „Der hat die neueste Liste!“ – und löschen ihre VLANs. Darum nehmen viele Admins VTP gar nicht erst.

**CDP/LLDP** sind wie Namensschilder, die sich Nachbarn beim Händeschütteln zeigen: „Ich bin Switch SW2, ich hänge an deinem Port Gi0/1.“ Damit findest du heraus, was wo angeschlossen ist. CDP gehört Cisco, LLDP ist für alle Hersteller.

Im Alltag gilt: Erst festlegen, dann vertrauen. Ein Port zum Nachbar-Switch wird fest zum Trunk gemacht, ein Port zum PC fest zum Access-Port – dann gibt es keine Überraschungen. Und wer VTP benutzt, schreibt sich Domäne, Passwort und aktuelle Revisionsnummer auf, bevor ein neuer Switch eingesteckt wird. Ein neuer Switch kommt am besten vorher in den Transparent-Modus oder bekommt Revision 0.

## Merksatz
- **DTP: desirable fragt, auto wartet – auto + auto = Access.**
- **VTP: höhere Revision gewinnt – Transparent/Off ist sicher.**
- **CDP 60/180 s, LLDP 30/120 s.**
- **Manuell konfigurieren + `switchport nonegotiate`.**

## Prüfungsfalle
- **auto ↔ auto** ergibt **keinen Trunk** (Prüfungsklassiker).
- VTP-Clients **können** VLANs nicht anlegen; ein Server ohne gleiches Passwort/Domäne synchronisiert nicht.
- Im **Transparent**-Modus werden Updates weitergeleitet, aber nicht übernommen; VLANs werden nur lokal gespeichert.
- LLDP ist bei Cisco **standardmäßig aus**, CDP an.
- `switchport nonegotiate` geht nicht bei `dynamic`-Modi.
- Extended VLANs (1006–4094) erfordern VTP v3 oder Transparent.

## Grafik
### DTP-Aushandlung
1. SW1 -> SW2: DTP-Frame: "Ich bin dynamic desirable"
2. SW2: dynamic auto – akzeptiert
3. SW2 -> SW1: DTP-Antwort: Trunk möglich
4. Text: Beide Ports wechseln in den Trunk-Betrieb (802.1Q)

### VTP-Update
1. SW1: VTP-Server – VLAN 30 neu angelegt, Revision 5 -> 6
2. SW1 -> SW2: VTP-Advertisement (Rev. 6, Domäne FIRMA)
3. SW2: Revision 6 > 5 – übernimmt Datenbank
4. SW2 -> SW3: Weiterleitung des Advertisements

## Lab
**Packet Tracer: SW1 – SW2 über g0/1, Domäne FIRMA**

### Cisco IOS
```
SW1(config)# interface g0/1
SW1(config-if)# switchport mode dynamic desirable
SW2(config)# interface g0/1
SW2(config-if)# switchport mode dynamic auto
SW1# show interfaces g0/1 switchport
SW1(config)# vtp mode server
SW1(config)# vtp domain FIRMA
SW1(config)# vtp password geheim
SW2(config)# vtp mode client
SW2(config)# vtp domain FIRMA
SW1(config)# vlan 30
SW2# show vlan brief
SW1# show vtp status
SW1# show cdp neighbors
```
Danach Absicherung: `switchport mode trunk` + `switchport nonegotiate`, VTP auf `transparent`. Passwörter nur im Lab verwenden.

## Befehle
- `switchport mode dynamic desirable|auto` – DTP-Modus
- `switchport nonegotiate` – DTP abschalten
- `show interfaces g0/1 switchport` – administrativer/operativer Modus
- `vtp mode server|client|transparent|off` – VTP-Rolle
- `show vtp status` – Domäne, Revision, Modus
- `show cdp neighbors detail` – Nachbarn mit IP
- `lldp run` – LLDP global aktivieren

## Übungen
- A: SW1 dynamic auto, SW2 dynamic auto – Trunk? | L: Nein, Access (beide warten passiv).
- A: SW1 desirable, SW2 auto – Ergebnis? | L: Trunk.
- A: Ein Switch mit Revision 20 wird in ein Netz mit Revision 8 (gleiche Domäne) gesteckt. Gefahr? | L: Seine Datenbank überschreibt alle anderen – VLANs können gelöscht werden.
- A: Wie sichert man Trunks gegen DTP-Angriffe? | L: mode trunk/access manuell, switchport nonegotiate, ungenutzte Ports shutdown.
- A: Welche Protokolle zeigen den Nachbarn mit Portangabe? | L: CDP (Cisco) und LLDP (IEEE 802.1AB).
- A: Welche VTP-Rolle ändert keine VLANs und gibt Updates trotzdem weiter? | L: Transparent leitet weiter, ändert nur lokal; Client übernimmt, kann nicht ändern.

## Karteikarten
- F: Was ist DTP? | A: Cisco-Protokoll, das automatisch Trunks aushandelt.
- F: Welche DTP-Kombination ergibt keinen Trunk? | A: dynamic auto + dynamic auto.
- F: Befehl gegen DTP-Frames? | A: switchport nonegotiate
- F: Was verteilt VTP? | A: Die VLAN-Datenbank (VLAN-IDs und Namen) über Trunks.
- F: Welche Zahl entscheidet bei VTP? | A: Die Configuration Revision Number (höher gewinnt).
- F: VTP-Modi? | A: Server, Client, Transparent, Off.
- F: CDP-Timer? | A: 60 s senden, 180 s Hold.
- F: LLDP-Standard? | A: IEEE 802.1AB, Timer 30/120 s, bei Cisco standardmäßig aus.
- F: Befehl für Nachbarn per CDP? | A: show cdp neighbors [detail]

## Quiz
? Welche Kombination bildet einen Trunk?
* desirable + auto
- auto + auto
- access + auto
- access + desirable
? Welche Zahl entscheidet, welcher Switch seine VLAN-Datenbank verteilt?
* Configuration Revision Number
- Bridge Priority
- VLAN-ID
- MAC-Adresse
? Welches Protokoll ist herstellerunabhängig?
* LLDP
- CDP
- VTP
- DTP
? Welcher VTP-Modus ist am sichersten gegen versehentliches Überschreiben?
* Transparent oder Off
- Server
- Client
- Desirable
? Welcher Befehl zeigt Nachbargeräte inklusive IP-Adresse?
* show cdp neighbors detail
- show interfaces trunk
- show vtp status
- show arp
? Standard-Sendeintervall von CDP?
* 60 Sekunden
- 30 Sekunden
- 5 Sekunden
- 180 Sekunden
? Wofür steht DTP?
* Dynamic Trunking Protocol
- Data Transfer Protocol
- Dynamic Tagging Protocol
- Device Trunk Process
? Ein VTP-Client…
* kann keine VLANs anlegen
- ist Standard-Server
- ignoriert Advertisements
- löscht alle VLANs
? Was verhindert DTP-Aushandlung am Port?
* switchport nonegotiate
- no cdp enable
- vtp off
- spanning-tree portfast
