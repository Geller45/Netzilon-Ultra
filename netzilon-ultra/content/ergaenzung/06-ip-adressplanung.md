---
id: erg-ip-adressplanung
bereich: AP1
block: ERG
kapitel: Ergänzungen 2.2
titel: IP-Adressplanung für ein Unternehmen – IPv4-VLSM, IPv6-Präfixe und Adresskonzept
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [AP1, AP2, CCNA]
quellen: [RFC 1918 (private IPv4-Adressen), RFC 4291 (IPv6-Adressarchitektur), RFC 6177 (IPv6-Präfixvergabe), IHK-Prüfungsaufgaben Subnetting]
verweise: [ap1-a4-ipv4, ap1-a4-subnetting, ap1-a4-ipv6, ap1-a4-ipv6-subnetting, ccna-vlsm, netz-ipv4-uebung-4-5, erg-zahlen-logik-praxis]
---

## Profi

### Vorgehen bei der Adressplanung
Ein Adresskonzept beantwortet: **Welche Netze** (Standorte, VLANs, DMZ, Transfernetze) brauche ich, **wie viele Hosts** je Netz (mit Reserve), **welcher Adressbereich** (privat nach RFC 1918), **welche Konventionen** (Gateway immer erste nutzbare Adresse, Server statisch, Clients per DHCP)?

**Private IPv4-Bereiche (RFC 1918)**: 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0–172.31.255.255), 192.168.0.0/16. Dazu **APIPA** 169.254.0.0/16 und **Loopback** 127.0.0.0/8.

### VLSM – Netze unterschiedlicher Größe
**Variable Length Subnet Mask** teilt einen Adressblock bedarfsgerecht auf. Regel: **größtes Netz zuerst** vergeben, damit die Blöcke an passenden Grenzen beginnen.

Nutzbare Hosts = 2^(32 − Präfix) − 2.
| Präfix | Maske | Blockgröße | nutzbare Hosts |
|---|---|---|---|
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /27 | 255.255.255.224 | 32 | 30 |
| /28 | 255.255.255.240 | 16 | 14 |
| /29 | 255.255.255.248 | 8 | 6 |
| /30 | 255.255.255.252 | 4 | 2 |
| /31 | 255.255.255.254 | 2 | 2 (nur Punkt-zu-Punkt, RFC 3021) |

**Beispiel** – Block 192.168.50.0/24, Bedarf: Verwaltung 100, Produktion 50, Gäste 20, Server 10, Transfernetz 2:
| Netz | Bedarf | Präfix | Netzadresse | Bereich nutzbar | Broadcast |
|---|---|---|---|---|---|
| Verwaltung | 100 | /25 | 192.168.50.0 | .1 – .126 | .127 |
| Produktion | 50 | /26 | 192.168.50.128 | .129 – .190 | .191 |
| Gäste | 20 | /27 | 192.168.50.192 | .193 – .222 | .223 |
| Server | 10 | /28 | 192.168.50.224 | .225 – .238 | .239 |
| Transfer | 2 | /30 | 192.168.50.240 | .241 – .242 | .243 |
Frei bleibt 192.168.50.244–.255 als Reserve.

### IPv6-Präfixplanung
- Ein Unternehmen erhält typischerweise ein **/48** (Provider oder RIR), kleine Anschlüsse oft ein **/56**.
- **Jedes LAN-Segment bekommt ein /64** – SLAAC und viele Funktionen setzen /64 voraus.
- Ein /48 enthält 2^(64−48) = **65.536 /64-Netze**, ein /56 enthält **256**.
- Struktur über die **Subnet-ID** (16 Bit beim /48): z. B. erste Hex-Stelle = Standort, zweite = Gebäude, letzte zwei = VLAN. Beispiel: 2001:db8:abcd:**1020**::/64 = Standort 1, Gebäude 0, VLAN 20.
- Dokumentationspräfix: **2001:db8::/32** (nur für Beispiele). Link-Local **fe80::/10**, Unique Local **fc00::/7** (praktisch fd00::/8), Multicast **ff00::/8**.

### Dokumentation
Adresskonzept als Tabelle (Netz, VLAN-ID, Präfix, Gateway, DHCP-Bereich, Reservierungen, Zweck), Pflege in einer **IPAM**-Lösung (z. B. Windows Server IPAM, NetBox). Gateway-Konvention und Reserve (mind. 20–30 %) festhalten.

## Einfach
Stell dir eine neue **Siedlung** vor. Du musst Straßen und Hausnummern verteilen. Eine große Straße für viele Häuser, kleine Gassen für wenige. Wenn du jeder Gasse gleich viele Nummern gibst, verschwendest du Nummern. Deshalb vergibst du sie **nach Bedarf**: zuerst die größte Straße, dann die nächstkleinere. Das ist **VLSM**.

Bei IPv4 ist ein Netz wie eine Straße. Die erste Nummer ist das **Straßenschild** (Netzadresse), die letzte ist der **Lautsprecher für alle** (Broadcast). Dazwischen wohnen die Geräte. Darum hat ein /24-Netz 256 Nummern, aber nur 254 für Geräte.

Die Netzgrößen gehen immer in **Zweierpotenzen**: 4, 8, 16, 32, 64, 128, 256. Brauchst du 50 Plätze, reicht 32 nicht – du nimmst 64 (/26). Brauchst du 20, nimmst du 32 (/27).

Bei **IPv6** gibt es so viele Nummern, dass man nicht mehr sparen muss. Jede Straße (jedes Netz) bekommt immer gleich viel: ein **/64**. Das sind mehr Adressen, als es Sandkörner auf der Erde gibt. Eine Firma bekommt meist ein **/48** – daraus kann sie 65.536 solcher Straßen machen. Damit man sich zurechtfindet, baut man die Nummer wie eine Postleitzahl auf: eine Stelle für den Standort, eine für das Gebäude, zwei für das VLAN.

Und ganz wichtig: Alles wird in eine **Tabelle** geschrieben. Ohne Plan weiß in einem Jahr niemand mehr, welche Nummer wohin gehört.

## Merksatz
- **Größtes Netz zuerst.**
- **Hosts = 2^Hostbits − 2.**
- **LAN in IPv6 = immer /64.**
- **/48 = 65.536 Subnetze, /56 = 256 Subnetze.**
- **Private Netze: 10/8, 172.16/12, 192.168/16.**

## Prüfungsfalle
- Bei der Hostberechnung die **−2** (Netz- und Broadcastadresse) vergessen.
- **172.32.0.0** ist **nicht** privat – der private Bereich endet bei 172.31.255.255.
- VLSM in falscher Reihenfolge (klein zuerst) führt zu Überschneidungen oder Lücken.
- In IPv6 gibt es **keinen Broadcast** – stattdessen Multicast.
- IPv6-LANs **nicht** kleiner als /64 planen (SLAAC funktioniert sonst nicht).

## Grafik
### VLSM-Aufteilung von 192.168.50.0/24
1. Planer: Bedarf sortieren – 100, 50, 20, 10, 2
2. Planer -> Verwaltung: 192.168.50.0/25
3. Planer -> Produktion: 192.168.50.128/26
4. Planer -> Gäste: 192.168.50.192/27
5. Planer -> Server: 192.168.50.224/28
6. Planer -> Transfer: 192.168.50.240/30
7. Planer: Rest .244 – .255 als Reserve dokumentieren

### IPv6-Präfix verteilen
1. Provider -> Firma: 2001:db8:abcd::/48
2. Firma -> Standort 1: 2001:db8:abcd:1000::/52
3. Standort 1 -> VLAN 20: 2001:db8:abcd:1020::/64
4. Router -> Clients: Router Advertisement mit dem /64-Präfix

## Lab
**Maschinen**: DHCP-/DNS-Server **SRV01** (Windows Server 2025) und Client **CL01** im Heimlabor **example.com**.

### GUI
1. **SRV01**: DHCP-Konsole → IPv4 → Neuer Bereich „Verwaltung“ 192.168.50.10 – 192.168.50.120, Maske 255.255.255.128, Router 192.168.50.1.
2. **SRV01**: Neuer Bereich „Produktion“ 192.168.50.140 – 192.168.50.190, Maske 255.255.255.192, Router 192.168.50.129.
3. **SRV01**: Adresskonzept als Tabelle im Dokumentationsordner ablegen bzw. in IPAM eintragen.
4. **CL01**: `ipconfig /all` → erhaltene Adresse und Maske mit dem Konzept vergleichen.

### PowerShell
```powershell
# Auf SRV01
Add-DhcpServerv4Scope -Name 'Verwaltung' -StartRange 192.168.50.10 -EndRange 192.168.50.120 -SubnetMask 255.255.255.128
Set-DhcpServerv4OptionValue -ScopeId 192.168.50.0 -Router 192.168.50.1
Add-DhcpServerv4Scope -Name 'Produktion' -StartRange 192.168.50.140 -EndRange 192.168.50.190 -SubnetMask 255.255.255.192
Set-DhcpServerv4OptionValue -ScopeId 192.168.50.128 -Router 192.168.50.129
Get-DhcpServerv4Scope | Format-Table ScopeId, SubnetMask, StartRange, EndRange
```

## Legende
### VLSM
- Was: Aufteilung eines Adressblocks in Subnetze unterschiedlicher Größe.
- Wie: Bedarf absteigend sortieren, für jedes Netz die kleinste passende Zweierpotenz wählen, Blöcke lückenlos aneinanderreihen.
- Wann: Bei jeder Adressplanung mit unterschiedlich großen Abteilungen oder Transfernetzen.
- Wo: Unternehmensnetze, Routerkonfiguration, IHK-Planungsaufgaben.
- Warum: Spart Adressen und hält Routingtabellen durch Zusammenfassung klein.

### Subnet-ID (IPv6)
- Was: Die Bits zwischen dem zugeteilten Präfix (z. B. /48) und /64.
- Wie: Strukturiert vergeben, z. B. Standort – Gebäude – VLAN in Hex-Stellen.
- Wann: Bei der Planung der IPv6-Netze eines Unternehmens.
- Wo: Im vierten Hextett bei einer /48-Zuteilung.
- Warum: Übersichtliche, zusammenfassbare Netze und leicht lesbare Dokumentation.

## Karteikarten
- F: Nennen Sie die drei privaten IPv4-Bereiche nach RFC 1918. | A: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.
- F: Wie viele nutzbare Hosts hat ein /27? | A: 30 (32 − 2).
- F: Welches Präfix braucht ein Netz mit 50 Hosts mindestens? | A: /26 (62 nutzbare Hosts).
- F: Grundregel bei VLSM? | A: Größtes Netz zuerst vergeben.
- F: Welches Präfix bekommt ein IPv6-LAN-Segment? | A: /64.
- F: Wie viele /64-Netze enthält ein /48? | A: 2^16 = 65.536.
- F: Wie viele /64-Netze enthält ein /56? | A: 2^8 = 256.
- F: Welches IPv6-Präfix ist für Dokumentation reserviert? | A: 2001:db8::/32.
- F: Wofür eignet sich ein /30 bzw. /31? | A: Punkt-zu-Punkt-Transfernetze zwischen Routern (2 Adressen).
- F: Was gehört in ein Adresskonzept? | A: Netz, VLAN-ID, Präfix/Maske, Gateway, DHCP-Bereich, Reservierungen, statische Adressen, Zweck, Reserve.

## Quiz
? Welches Präfix ist für ein Netz mit 100 Hosts am sparsamsten?
* /25
- /24
- /26
- /23
! /25 bietet 126 nutzbare Adressen, /26 nur 62.

? Welche Adresse ist NICHT privat nach RFC 1918?
* 172.32.10.1
- 10.255.0.1
- 172.20.1.1
- 192.168.200.1
! Der Bereich 172.16.0.0/12 endet bei 172.31.255.255.

? Wie lautet die Broadcastadresse von 192.168.50.192/27?
* 192.168.50.223
- 192.168.50.255
- 192.168.50.224
- 192.168.50.207
! Blockgröße 32: .192 bis .223.

? Wie viele /64-Netze kann ein Unternehmen mit einem /56 bilden?
* 256
- 64
- 65.536
- 16
! 64 − 56 = 8 Bit → 2^8.

? Welche Präfixlänge sollte ein IPv6-Client-LAN haben?
* /64
- /48
- /96
- /127
! SLAAC und EUI-64 setzen ein /64 voraus.

? In welcher Reihenfolge werden Netze bei VLSM vergeben?
* Vom größten zum kleinsten Bedarf
- Vom kleinsten zum größten Bedarf
- Alphabetisch nach Abteilung
- Zufällig
! So beginnen alle Blöcke auf passenden Grenzen ohne Überschneidung.

? Wie viele nutzbare Hostadressen hat ein /28?
* 14
- 16
- 30
- 6
! 2^4 − 2 = 14.

? Was ist die Netzadresse von 10.1.1.77/26?
* 10.1.1.64
- 10.1.1.0
- 10.1.1.76
- 10.1.1.128
! Blockgröße 64: 0, 64, 128, 192 – 77 liegt im Block ab 64.

? Wofür steht das Präfix fe80::/10?
* Link-Local-Adressen
- Globale Unicast-Adressen
- Multicast-Adressen
- Dokumentationsadressen
! Link-Local wird auf jeder IPv6-Schnittstelle automatisch erzeugt und nicht geroutet.

## Lücken
- Ein /26 hat {62} nutzbare Hostadressen.
- Bei VLSM wird das {größte} Netz zuerst vergeben.
- IPv6-LANs erhalten ein Präfix der Länge {/64|64}.
- Ein /48 enthält {65.536|65536} /64-Netze.
- Der private Bereich 172.16.0.0/12 endet bei {172.31.255.255}.

## Zuordnen
### Bedarf und kleinstes passendes Präfix
- 2 Hosts (Transfernetz) => /30
- 12 Hosts => /28
- 25 Hosts => /27
- 60 Hosts => /26
- 120 Hosts => /25

### IPv6-Bereich und Bedeutung
- 2001:db8::/32 => Dokumentation
- fe80::/10 => Link-Local
- fd00::/8 => Unique Local (privat)
- ff00::/8 => Multicast
- ::1/128 => Loopback

### IPv4-Bereich und Bedeutung
- 10.0.0.0/8 => privat (RFC 1918)
- 169.254.0.0/16 => APIPA
- 127.0.0.0/8 => Loopback
- 224.0.0.0/4 => Multicast

## Reihenfolge
### VLSM-Planung
1. Bedarf je Netz inklusive Reserve ermitteln
2. Netze nach Größe absteigend sortieren
3. Für jedes Netz das kleinste passende Präfix wählen
4. Blöcke lückenlos ab Beginn des Adressbereichs vergeben
5. Netz-, Gateway- und Broadcastadressen dokumentieren

### IPv6-Präfix für ein VLAN ableiten
1. Zugeteiltes Präfix ermitteln (z. B. /48)
2. Schema für die Subnet-ID festlegen
3. Standort- und Gebäudestelle einsetzen
4. VLAN-Stellen einsetzen
5. /64 an der Router-Schnittstelle konfigurieren

### Netzadresse und Broadcast bestimmen
1. Blockgröße aus dem Präfix berechnen
2. Vielfaches der Blockgröße unterhalb der Hostadresse suchen
3. Dieses Vielfache als Netzadresse notieren
4. Nächstes Vielfaches minus 1 als Broadcast notieren

## Freitext
- F: Teilen Sie 10.10.0.0/24 per VLSM auf: Netz A 60 Hosts, Netz B 28 Hosts, Netz C 12 Hosts, zwei Transfernetze. Geben Sie Netzadresse und Präfix an. | M: A 10.10.0.0/26; B 10.10.0.64/27; C 10.10.0.96/28; Transfer 1 10.10.0.112/30; Transfer 2 10.10.0.116/30. | P: 6
- F: Begründen Sie, warum IPv6-LAN-Segmente ein /64 erhalten, obwohl dadurch viele Adressen ungenutzt bleiben. | M: SLAAC/EUI-64 und Privacy Extensions setzen 64-Bit-Interface-IDs voraus; Adressraum ist ausreichend groß; einheitliche Planung und einfache Zusammenfassung. | P: 3
- F: Nennen Sie vier Inhalte eines Adresskonzepts. | M: Netzadresse/Präfix, VLAN-ID, Gateway, DHCP-Bereich, Reservierungen/statische Adressen, Zweck/Standort, Reserve, Verantwortlicher. | P: 4

## Szenario
### Neuer Standort Kassel
Die Firma erhält für den Standort Kassel den Block 172.20.8.0/22. Benötigt werden: Clients 400, VoIP 200, WLAN-Gäste 100, Server 20.
- F: Welche Präfixe wählen Sie? | A: Clients /23 (510), VoIP /24 (254), Gäste /25 (126), Server /27 (30). | P: 4
- F: Wie lauten die Netzadressen bei VLSM? | A: Clients 172.20.8.0/23, VoIP 172.20.10.0/24, Gäste 172.20.11.0/25, Server 172.20.11.128/27. | P: 4

### IPv6-Einführung
Der Provider teilt 2001:db8:4711::/48 zu. Schema: erste Hex-Stelle der Subnet-ID = Standort (1 = Zentrale), letzte zwei = VLAN.
- F: Welches Präfix erhält VLAN 30 in der Zentrale? | A: 2001:db8:4711:1030::/64 (Gebäude-Stelle 0). | P: 2
- F: Wie erhalten die Clients ihre Adressen ohne DHCPv6? | A: Per SLAAC aus dem Router Advertisement (Präfix + selbst gebildete Interface-ID). | P: 2

### Adresskonflikt nach Erweiterung
Ein Kollege hat für ein neues 30-Host-Netz 192.168.50.128/27 vergeben, obwohl dort bereits Produktion (192.168.50.128/26) liegt.
- F: Warum ist das ein Fehler? | A: Der /27 liegt vollständig innerhalb des /26 – Überschneidung, Routing und Erreichbarkeit werden fehlerhaft. | P: 2
- F: Welchen freien Block schlagen Sie im Beispielkonzept vor? | A: Freie Reserve .244–.255 reicht nicht für /27; daher anderer Block (z. B. neuer /24) oder Umplanung nötig. | P: 2
