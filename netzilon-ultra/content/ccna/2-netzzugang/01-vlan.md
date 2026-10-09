---
id: ccna-vlan
bereich: CCNA
block: CCNA 2.1
kapitel: Network Access
titel: VLANs auf Cisco-Switches – Access-Ports, Voice-VLAN, Default-VLAN
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, VLAN.md, 200_301_CCNA_v1.0_2.pdf]
verweise: [ap1-a4-vlan, ccna-trunk-intervlan, ccna-dtp-vtp, ccna-qos, ccna-switching-mac-arp, az800-vswitch]
---

## Profi

### LAN = Broadcastdomäne
Ein **LAN** ist eine einzelne **Broadcastdomäne**: alle Geräte, die einen Broadcast (Ziel-MAC ffff.ffff.ffff) eines Mitglieds empfangen. Ohne VLANs bildet ein Switch(-verbund) **eine** große Broadcastdomäne – Nachteile: **Performance** (unnötige Broadcasts erreichen alle) und **Sicherheit** (Geräte erreichen sich direkt, ohne dass Verkehr über Router/Firewall läuft; dortige Regeln greifen nicht).

### VLAN
Ein **VLAN** trennt Endgeräte **logisch auf Layer 2**. Es wird **pro Switch-Interface** konfiguriert; jedes Endgerät an einem Port gehört zu dessen VLAN. Ein Switch leitet **keinen** Verkehr direkt zwischen VLANs weiter – dafür braucht man einen **Router** oder **L3-Switch** (Inter-VLAN-Routing). Regel: **1 VLAN = 1 Subnetz = 1 Broadcastdomäne**.
Nutzen: weniger Broadcasts und **unbekannte Unicasts** pro Segment, Sicherheit (Filter am Router/Firewall), Organisation nach Funktion statt nach Standort, QoS (Voice-VLAN).

### VLAN-Bereiche (Cisco)
| Bereich | Nutzung |
|---|---|
| 0, 4095 | reserviert (nicht nutzbar) |
| **1** | **Default-VLAN**: alle Ports sind anfangs in VLAN 1; nicht löschbar; Standard-Native-VLAN; CDP/VTP/DTP laufen darüber |
| 2–1001 | **Normal Range** (Blueprint 2.1) – gespeichert in `flash:vlan.dat` |
| 1002–1005 | reserviert für FDDI/Token Ring, existieren standardmäßig, nicht löschbar |
| 1006–4094 | **Extended Range** (VTPv3 oder Transparent-Modus, in running-config) |
Auf einem neuen Switch existieren also **fünf** VLANs: 1, 1002, 1003, 1004, 1005.

### Access-Ports
Ein **Access-Port** gehört genau **einem** VLAN, Frames sind **untagged**; angeschlossen werden Endgeräte (PC, Drucker, Server).
```
SW1(config)# vlan 10
SW1(config-vlan)# name ENGINEERING
SW1(config-vlan)# vlan 20
SW1(config-vlan)# name HR
SW1(config-vlan)# exit
SW1(config)# interface range g1/0/1 - 12
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
SW1(config-if-range)# exit
SW1(config)# interface range g1/0/13 - 20
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 20
```
Wird mit `switchport access vlan 30` ein nicht existierendes VLAN zugewiesen, **legt der Switch es automatisch an** („% Access VLAN does not exist. Creating vlan 30“).

### Voice-VLAN (Daten und Sprache an einem Port)
IP-Telefone haben einen **internen 3-Port-Switch**: Uplink zum Switch, Downlink zum PC, intern zum Telefon. PC-Verkehr bleibt **untagged** im Daten-VLAN, Telefonverkehr wird **getaggt** im **Voice-VLAN** (mit **CoS 5** für Sprache). Der Port gilt trotzdem als **Access-Port** („Multi-VLAN Access Port“), nicht als Trunk. Das Telefon lernt das Voice-VLAN per **CDP** (oder LLDP-MED).
```
SW1(config)# interface g1/0/5
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport voice vlan 11
SW1(config-if)# mls qos trust cos
SW1(config-if)# spanning-tree portfast
```
`show interfaces g1/0/5 switchport` zeigt „Voice VLAN: 11“.

### Prüfen
`show vlan brief` (VLAN, Name, Status, Access-Ports – **Trunks erscheinen dort nicht**), `show vlan id 10`, `show interfaces status`, `show interfaces g1/0/5 switchport`.

### Sicherheit
- Unbenutzte Ports: `shutdown` und in ein **ungenutztes „Black-Hole“-VLAN** legen.
- VLAN 1 nicht für Benutzer- oder Management-Verkehr verwenden.
- Ports fest als Access konfigurieren (`switchport mode access`) → DTP aus.

## Einfach

Stell dir eine **Schule mit einem großen Pausenhof** vor. Ohne VLANs hört **jeder jede Durchsage**, und jeder kann jedem den Ball klauen.

**VLANs** sind wie **farbige Bänder**: Klasse 10 trägt **blaue**, Klasse 20 **rote** Bänder. Der Switch (die Aufsicht) achtet darauf, dass **Blau nur mit Blau** spielt und Durchsagen für Blau nur bei Blau ankommen. Wer mit Rot reden will, muss über das **Sekretariat** (den Router) gehen – und dort kann man kontrollieren, ob das erlaubt ist.

Ein **Access-Port** ist eine **Steckdose mit fester Farbe**: Wer hier einsteckt, ist automatisch blau.

Am Anfang haben **alle Steckdosen die Farbe 1** (das Default-VLAN). Die musst du erst umfärben.

Ein **IP-Telefon** ist ein Sonderfall: Telefon und PC hängen hintereinander an **einer** Steckdose. Der PC-Verkehr bleibt „ohne Band“ (untagged, Daten-VLAN), das Telefon klebt seinen Paketen ein **Sprach-Etikett** drauf (Voice-VLAN, getaggt). So bekommt Sprache Vorfahrt und ist vom PC getrennt.

## Merksatz
- **1 VLAN = 1 Subnetz = 1 Broadcastdomäne.**
- **Access = 1 VLAN, untagged.**
- **Default-VLAN 1, neu: 1 + 1002–1005.**
- **Normal 1–1005, Extended 1006–4094.**
- **Voice-VLAN: PC untagged, Telefon tagged (CoS 5).**

## Prüfungsfalle
- `show vlan brief` zeigt **keine Trunk-Ports**.
- VLAN 1 und 1002–1005 können **nicht gelöscht** werden.
- Ein Port mit Voice-VLAN ist ein **Access-Port**, kein Trunk.
- Hosts in verschiedenen VLANs erreichen sich auch bei passendem Subnetz **nicht** ohne Router.
- Löscht man ein VLAN, werden dessen Ports **inaktiv** (nicht automatisch VLAN 1).
- Obsidian-Notiz „VLAN“: Die „No-Tagged VLAN“-Tabelle ordnet das VLAN je **MAC** zu – das ist das MAC-basierte VLAN; Standard in der Praxis (und bei Cisco) ist das **portbasierte** VLAN (`switchport access vlan`).

## Grafik
### Broadcast im VLAN
1. PC1: Gehört zu VLAN 10, sendet Broadcast
2. PC1 -> SW1: Frame an ffff.ffff.ffff
3. SW1 -> PC3: Weiterleitung nur an Ports in VLAN 10
4. SW1: PC2 in VLAN 20 erhält nichts
5. SW1 -> R1: Router-Port in VLAN 10 erhält den Broadcast, leitet ihn aber nicht weiter

### Voice-VLAN
1. PC1 -> Telefon: Frame untagged
2. Telefon -> SW1: PC-Frame untagged (VLAN 10)
3. Telefon -> SW1: Sprachframe mit Tag VLAN 11, CoS 5
4. SW1: Trennt Daten und Sprache, Sprache bekommt Vorrang

## Lab
**Packet Tracer: SW1 (Catalyst 2960), PC1/PC2 in VLAN 10 (ENGINEERING), PC3/PC4 in VLAN 20 (HR), IP-Phone 7960 an Fa0/5**

### Cisco IOS
```
SW1> enable
SW1# configure terminal
SW1(config)# vlan 10
SW1(config-vlan)# name ENGINEERING
SW1(config-vlan)# vlan 20
SW1(config-vlan)# name HR
SW1(config-vlan)# vlan 11
SW1(config-vlan)# name VOICE
SW1(config-vlan)# vlan 999
SW1(config-vlan)# name BLACKHOLE
SW1(config-vlan)# exit
SW1(config)# interface range fa0/1 - 2
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
SW1(config-if-range)# interface range fa0/3 - 4
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 20
SW1(config-if-range)# interface fa0/5
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# switchport voice vlan 11
SW1(config-if)# interface range fa0/6 - 24
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 999
SW1(config-if-range)# shutdown
SW1(config-if-range)# end
SW1# show vlan brief
SW1# show interfaces fa0/5 switchport
```
Test: PC1 (192.168.10.11/24) pingt PC2 (192.168.10.12) → ok; PC3 (192.168.20.13) → nicht erreichbar (kein Router).

## Befehle
- `vlan 10` – VLAN anlegen bzw. VLAN-Modus öffnen
- `name ENGINEERING` – VLAN benennen
- `switchport mode access` – Port fest als Access-Port
- `switchport access vlan 10` – Port VLAN 10 zuordnen
- `switchport voice vlan 11` – Voice-VLAN für IP-Telefon
- `show vlan brief` – VLANs und Access-Ports
- `show interfaces fa0/5 switchport` – Modus, Access- und Voice-VLAN eines Ports
- `no vlan 20` – VLAN löschen (Ports werden inaktiv)

## Übungen
- A: Welche VLANs existieren auf einem neuen Cisco-Switch? | L: 1 (default) sowie 1002, 1003, 1004, 1005.
- A: Zwei PCs in VLAN 10 und 20 mit IPs aus 10.0.0.0/24 – Ping? | L: Nein, getrennte Broadcastdomänen; ARP erreicht den anderen nicht.
- A: Konfiguriere Fa0/7 für PC (VLAN 30) und Telefon (VLAN 31). | L: interface fa0/7 → switchport mode access → switchport access vlan 30 → switchport voice vlan 31.
- A: Nenne zwei Gründe für VLANs aus Sicht von Performance und Sicherheit. | L: Weniger Broadcast-/unbekannter Unicast-Verkehr pro Segment; Verkehr zwischen Abteilungen muss über Router/Firewall und kann gefiltert werden.

## Karteikarten
- F: Was ist ein VLAN? | A: Ein logisches LAN – eigene Broadcastdomäne auf Layer 2, pro Switchport konfiguriert.
- F: Was ist das Default-VLAN? | A: VLAN 1 – alle Ports sind anfangs darin, es kann nicht gelöscht werden.
- F: Welcher VLAN-Bereich ist Normal Range? | A: 1–1005 (nutzbar 1–1001).
- F: Welcher Bereich ist Extended Range? | A: 1006–4094.
- F: Was ist ein Access-Port? | A: Port in genau einem VLAN, Frames untagged.
- F: Wie wird Telefonverkehr am Voice-VLAN-Port übertragen? | A: Getaggt im Voice-VLAN (CoS 5), PC-Verkehr untagged im Daten-VLAN.
- F: Woher kennt das IP-Telefon das Voice-VLAN? | A: Über CDP (oder LLDP-MED).
- F: Welcher Befehl zeigt VLANs und zugeordnete Ports? | A: show vlan brief
- F: Wo speichert ein Switch Normal-Range-VLANs? | A: In flash:vlan.dat.
- F: Was passiert bei switchport access vlan 30, wenn VLAN 30 fehlt? | A: Der Switch legt VLAN 30 automatisch an.

## Quiz
? Welche VLANs existieren standardmäßig auf einem Cisco-Switch?
* 1 und 1002–1005
- 1–1005
- Nur VLAN 1
- 1 und 4095

? Was zeigt „show vlan brief“ NICHT an?
* Trunk-Ports
- VLAN-Namen
- Access-Ports der VLANs
- Status der VLANs

? Wie wird PC-Verkehr an einem Port mit Voice-VLAN übertragen?
* Untagged im Access-VLAN
- Getaggt im Voice-VLAN
- Getaggt im Native VLAN
- Gar nicht, PC und Telefon brauchen getrennte Ports

? Was ist nötig, damit Hosts in VLAN 10 und VLAN 20 kommunizieren?
* Ein Router oder Layer-3-Switch
- Ein zweiter Access-Port
- Ein Hub zwischen den VLANs
- Das gleiche Subnetz auf beiden Seiten

? Welcher Bereich ist die Extended Range?
* 1006–4094
- 1–1005
- 1002–1005
- 4096–8191

? Mit welchem Befehl wird ein Port VLAN 20 zugeordnet?
* switchport access vlan 20
- vlan 20 access
- switchport trunk vlan 20
- interface vlan 20

? Welche QoS-Markierung setzt ein IP-Telefon für Sprachframes?
* CoS 5
- CoS 3
- CoS 0
- CoS 7

? Was ist eine Sicherheitsempfehlung für unbenutzte Switchports?
* Abschalten und einem ungenutzten VLAN zuweisen
- In VLAN 1 belassen
- Als Trunk konfigurieren
- Native VLAN auf 1 setzen

## Lücken
- Neue Switchports gehören zum VLAN {1}.
- Ein {Access}-Port gehört genau einem VLAN.
- Telefonverkehr läuft getaggt im {Voice}-VLAN.
- VLANs von 1006 bis 4094 heißen {Extended Range}.

## Spickzettel
- 1 VLAN = 1 Subnetz = 1 Broadcastdomäne
- vlan 10 / name … · switchport mode access · switchport access vlan 10
- switchport voice vlan 11 (Telefon tagged, PC untagged)
- Default 1 + 1002–1005 · Normal 1–1005 · Extended 1006–4094
- show vlan brief (ohne Trunks) · show interfaces x switchport
