---
id: erg-wlan-planung
bereich: AP1
block: ERG
kapitel: Ergänzungen 2.2
titel: WLAN planen und absichern – Standards, Frequenzen, Kanäle, Ausleuchtung, WPA3 und Enterprise-Anmeldung
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [AP1, AP2, CCNA]
quellen: [IEEE 802.11-2020 und Ergänzungen ax/be, Wi-Fi Alliance (WPA3, Wi-Fi 6E/7), Bundesnetzagentur Frequenzzuteilung WLAN, IHK-Prüfungskatalog FiSi]
verweise: [ccna-wlan-grundlagen, ccna-wlan-architektur, ccna-wlan-sicherheit, ihk-lz-vlan-wlan-ipv6, legacy-vpn-wlan-tls, az800-nps, erg-vlan-routing-kmu]
---

## Profi

### Standards und Frequenzbänder
| IEEE | Wi-Fi-Name | Band | max. Kanalbreite | theoretische Brutto-Datenrate (max.) |
|---|---|---|---|---|
| 802.11n | Wi-Fi 4 | 2,4 und 5 GHz | 40 MHz | 600 Mbit/s |
| 802.11ac | Wi-Fi 5 | 5 GHz | 160 MHz | ca. 6,9 Gbit/s |
| 802.11ax | Wi-Fi 6 / 6E | 2,4 / 5 (6E: zusätzlich 6 GHz) | 160 MHz | ca. 9,6 Gbit/s |
| 802.11be | Wi-Fi 7 | 2,4 / 5 / 6 GHz | 320 MHz | ca. 46 Gbit/s |

Die Bruttowerte gelten nur theoretisch (viele Antennen-Streams, optimale Bedingungen); real liegt der Nettodurchsatz oft bei weniger als der Hälfte. WLAN ist ein **geteiltes Medium** (Halbduplex, Zugriff per **CSMA/CA**) – alle Clients einer Funkzelle teilen sich die Kapazität.

**2,4 GHz**: größere Reichweite, gute Wanddurchdringung, aber nur wenige überlappungsfreie 20-MHz-Kanäle (in Europa üblich **1, 6, 11** bzw. 1, 5, 9, 13) und viele Störquellen (Bluetooth, Mikrowelle). **5 GHz**: viele Kanäle, höhere Datenraten, geringere Reichweite; Teile des Bandes erfordern **DFS** (Dynamic Frequency Selection, Radarerkennung) und **TPC**. **6 GHz** (Wi-Fi 6E/7): viele breite Kanäle, wenig Störer, geringste Reichweite, nur WPA3.

### Planung und Ausleuchtung
1. **Anforderungen**: Fläche, Anzahl und Art der Clients (Laptops, Scanner, VoIP), Anwendungen, gewünschte Mindestsignalstärke (Daten ca. −67 dBm, Sprache/Video etwas besser), Kapazität statt nur Abdeckung.
2. **Vorab-Planung** mit Grundriss und Wanddämpfung (Planungssoftware).
3. **Site Survey** (Ausleuchtungsmessung) vor Ort, nach der Installation **Validierung**.
4. **Kanalplanung**: benachbarte APs auf nicht überlappenden Kanälen, Sendeleistung anpassen, Zellüberlappung von ca. 15–20 % für Roaming.
5. **Infrastruktur**: Switches mit **PoE** (802.3at/bt), VLANs je SSID, zentraler **WLAN-Controller** oder Cloud-Management.

### Sicherheit
| Verfahren | Bewertung |
|---|---|
| Offen / WEP / WPA (TKIP) | unsicher – nicht mehr verwenden |
| WPA2-Personal (PSK, AES-CCMP) | ausreichend mit langem Schlüssel, aber anfällig für Offline-Wörterbuchangriffe |
| **WPA3-Personal (SAE)** | Schutz gegen Offline-Wörterbuchangriffe, Forward Secrecy |
| **WPA2/WPA3-Enterprise (802.1X)** | individuelle Anmeldung über **RADIUS** (z. B. NPS) mit EAP-TLS (Zertifikat) oder PEAP |

Zusätzlich: **Gäste-SSID** in eigenem VLAN mit **Client-Isolation** und Captive Portal, **PMF** (Protected Management Frames, 802.11w) gegen Deauth-Angriffe, Firmware aktuell halten, WPS deaktivieren, **Rogue-AP-Erkennung**. Das Verstecken der SSID ist **kein** Sicherheitsmerkmal.

## Einfach
WLAN ist wie ein **Radiosender**, nur dass beide Seiten senden und empfangen können. Der **Access Point** ist der Sender im Raum, Laptops und Handys sind die Zuhörer, die auch antworten.

Es gibt zwei große **Radiobänder**:
- **2,4 GHz** ist wie ein tiefer Ton – er kommt weit und durch Wände, aber es gibt nur wenige Sender-Plätze, und viele Geräte (sogar die Mikrowelle) stören.
- **5 GHz** und **6 GHz** sind wie hohe Töne – schneller und mit viel mehr Platz, aber sie kommen nicht so weit.

Alle Geräte an einem Access Point müssen sich **abwechseln**, wie Kinder in der Klasse, die sich melden müssen, bevor sie sprechen. Deshalb wird es langsamer, je mehr Geräte im selben WLAN sind.

Wenn du ein ganzes Gebäude mit WLAN versorgen willst, stellst du mehrere Access Points auf. Nebeneinanderstehende dürfen nicht auf demselben **Kanal** senden, sonst reden sie durcheinander. Vorher misst man mit einem Laptop und einer App, wo das Signal stark und wo es schwach ist – das ist die **Ausleuchtung**.

Damit niemand Fremdes mithört, wird das WLAN **verschlüsselt**. Zu Hause reicht ein langes Passwort mit **WPA3**. In der Firma meldet sich **jeder Mitarbeiter einzeln** an, mit Benutzername oder Zertifikat – das ist **Enterprise**. Gäste kommen in ein **eigenes Gäste-WLAN**, damit sie nur ins Internet können und nicht an die Firmendaten.

## Merksatz
- **2,4 GHz = weit, wenig Kanäle (1/6/11). 5/6 GHz = schnell, kurz.**
- **WLAN ist geteilt und halbduplex – CSMA/CA.**
- **Wi-Fi 4 = n, 5 = ac, 6 = ax, 7 = be.**
- **Firma: WPA2/3-Enterprise mit 802.1X und RADIUS.**
- **SSID verstecken ist kein Schutz.**

## Prüfungsfalle
- Die angegebene **Bruttodatenrate** ist nie der echte Durchsatz.
- **CSMA/CA** (Vermeidung) im WLAN, **CSMA/CD** (Erkennung) im alten Halbduplex-Ethernet.
- Mehr Sendeleistung löst kein Kapazitätsproblem – oft hilft nur **mehr APs mit weniger Leistung**.
- **WPA2-PSK** mit gemeinsamem Kennwort ist für Firmen ungeeignet (kein individuelles Sperren möglich).
- **MAC-Filter** und versteckte SSID sind leicht zu umgehen.

## Grafik
### WPA2/WPA3-Enterprise-Anmeldung (802.1X)
1. Notebook -> Access Point: Assoziierung mit SSID „Firma“
2. Access Point -> Notebook: EAP-Request Identity
3. Notebook -> Access Point: Identität (Zertifikat/Benutzer)
4. Access Point -> RADIUS-Server: Access-Request
5. RADIUS-Server: Prüft Zertifikat und Netzwerkrichtlinie
6. RADIUS-Server -> Access Point: Access-Accept mit VLAN-Zuweisung
7. Access Point -> Notebook: Schlüsselaustausch (4-Way-Handshake)

### Kanalplanung 2,4 GHz
1. AP1: Kanal 1
2. AP2: Kanal 6
3. AP3: Kanal 11
4. AP4: Kanal 1 – weit entfernt von AP1

## Lab
**Maschinen**: Windows-11-Notebook **NB01** und RADIUS-Server **SRV-NPS** (Windows Server 2025, Rolle NPS) im Heimlabor **example.com**, WLAN-Access-Point mit WPA2/3-Enterprise.

### GUI
1. **NB01**: Einstellungen → Netzwerk und Internet → WLAN → Eigenschaften des verbundenen Netzes: Protokoll, Sicherheitstyp, Netzwerkband, Kanal ablesen.
2. **SRV-NPS**: Netzwerkrichtlinienserver → RADIUS-Clients → Access Point mit IP und gemeinsamem geheimen Schlüssel eintragen.
3. **SRV-NPS**: Assistent „RADIUS-Server für drahtlose 802.1X-Verbindungen“ → Authentifizierungsmethode PEAP oder EAP-TLS, Benutzergruppe „WLAN-Benutzer“ wählen.
4. **NB01**: Mit SSID verbinden und im Ereignisprotokoll auf SRV-NPS (Sicherheit, Ereignis 6272 „Zugriff gewährt“) die Anmeldung prüfen.

### PowerShell
```powershell
# Auf NB01
netsh wlan show interfaces          # SSID, Kanal, Signal, Funktyp, Authentifizierung
netsh wlan show networks mode=bssid # sichtbare APs und Kanäle
netsh wlan show wlanreport          # HTML-Bericht über Verbindungen

# Auf SRV-NPS
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=6272,6273} -MaxEvents 10
```

## Legende
### 802.1X
- Was: Portbasierte Netzwerkzugangskontrolle mit individueller Authentifizierung.
- Wie: Supplicant (Client) – Authenticator (AP/Switch) – Authentication Server (RADIUS) mit EAP.
- Wann: In Firmen-WLANs und an Switchports, an denen nur bekannte Geräte/Benutzer arbeiten sollen.
- Wo: WPA2/WPA3-Enterprise, NPS unter Windows Server, FreeRADIUS.
- Warum: Jeder Benutzer/jedes Gerät ist einzeln sperrbar, kein gemeinsames Kennwort.

### Site Survey
- Was: Messung der Funkabdeckung, Störungen und Kanalbelegung vor Ort.
- Wie: Begehung mit Messsoftware und Laptop, Ergebnis als Heatmap.
- Wann: Vor der Installation (Planung) und danach (Validierung).
- Wo: Im gesamten zu versorgenden Gebäude.
- Warum: Funklöcher, Störer und falsche AP-Positionen werden vor dem Betrieb erkannt.

## Karteikarten
- F: Welche Wi-Fi-Generation entspricht 802.11ax? | A: Wi-Fi 6 (mit 6-GHz-Band: Wi-Fi 6E).
- F: Welche 2,4-GHz-Kanäle überlappen sich bei 20 MHz nicht (klassische Planung)? | A: 1, 6 und 11 (in Europa auch 1, 5, 9, 13).
- F: Welches Zugriffsverfahren nutzt WLAN? | A: CSMA/CA (Carrier Sense Multiple Access with Collision Avoidance).
- F: Vorteil von 5 GHz gegenüber 2,4 GHz? | A: Mehr überlappungsfreie Kanäle, höhere Datenraten, weniger Störer.
- F: Nachteil von 5/6 GHz? | A: Geringere Reichweite und schlechtere Durchdringung von Wänden.
- F: Was ist WPA3-SAE? | A: Simultaneous Authentication of Equals – Schlüsselaustausch, der Offline-Wörterbuchangriffe verhindert.
- F: Welche Komponenten gehören zu WPA-Enterprise? | A: Client (Supplicant), Access Point (Authenticator), RADIUS-Server (z. B. NPS) und meist eine PKI.
- F: Was ist DFS? | A: Dynamic Frequency Selection – AP muss in bestimmten 5-GHz-Kanälen Radar erkennen und ausweichen.
- F: Wozu dient eine Gäste-SSID mit Client-Isolation? | A: Gäste erhalten nur Internetzugang, sind vom Firmennetz und voneinander getrennt.
- F: Ist eine versteckte SSID ein Sicherheitsmerkmal? | A: Nein, sie lässt sich mit einfachen Werkzeugen ermitteln.

## Quiz
? Welches Verfahren eignet sich für ein Firmen-WLAN mit individueller Anmeldung?
* WPA2/WPA3-Enterprise mit 802.1X und RADIUS
- WPA2-Personal mit gemeinsamem Kennwort
- WEP mit 128 Bit
- Offenes WLAN mit versteckter SSID
! Enterprise erlaubt das Sperren einzelner Benutzer oder Geräte.

? Welches Zugriffsverfahren wird im WLAN verwendet?
* CSMA/CA
- CSMA/CD
- Token Passing
- TDMA wie im Mobilfunk
! Kollisionen lassen sich im Funk nicht erkennen, daher Vermeidung.

? Welche Wi-Fi-Bezeichnung gehört zu IEEE 802.11ac?
* Wi-Fi 5
- Wi-Fi 4
- Wi-Fi 6
- Wi-Fi 7
! n = 4, ac = 5, ax = 6, be = 7.

? Welche Kanalkombination ist im 2,4-GHz-Band klassisch überlappungsfrei?
* 1, 6, 11
- 1, 2, 3
- 3, 7, 12
- 2, 4, 6
! Bei 20 MHz Breite liegen diese Kanäle ausreichend weit auseinander.

? Welche Aussage zu 6 GHz (Wi-Fi 6E) ist richtig?
* Viele breite Kanäle, aber geringe Reichweite
- Größte Reichweite aller WLAN-Bänder
- Nur für WEP zugelassen
- Kompatibel mit allen Wi-Fi-4-Geräten
! Im 6-GHz-Band ist WPA3 Pflicht.

? Ein Access Point mit vielen Clients ist überlastet. Was hilft am ehesten?
* Zusätzliche Access Points mit angepasster Sendeleistung und Kanalplanung
- Sendeleistung auf Maximum erhöhen
- SSID verstecken
- Auf 2,4 GHz umstellen
! Kapazität entsteht durch mehr Funkzellen, nicht durch mehr Leistung.

? Was schützt WPA3-Personal besser als WPA2-Personal?
* Offline-Wörterbuchangriffe auf den mitgeschnittenen Handshake
- Physischen Diebstahl des Access Points
- Phishing-E-Mails
- Ausfall des Stroms
! SAE ersetzt den PSK-Handshake, sodass Kennwörter nicht offline geraten werden können.

? Welche Aufgabe übernimmt der RADIUS-Server bei 802.1X?
* Er prüft die Anmeldedaten und erteilt oder verweigert den Zugang.
- Er vergibt IP-Adressen.
- Er strahlt das Funksignal aus.
- Er löst Namen in IP-Adressen auf.
! Der Access Point leitet nur weiter (Authenticator).

? Was ist das Ziel eines Site Surveys?
* Funkabdeckung und Störungen vor Ort messen
- Kennwörter der Benutzer prüfen
- Firmware der Clients aktualisieren
- Den Internetanschluss testen
! Ergebnis ist meist eine Heatmap der Signalstärke.

## Lücken
- WLAN nutzt das Zugriffsverfahren {CSMA/CA}.
- IEEE 802.11ax wird als Wi-Fi {6} vermarktet.
- Im 2,4-GHz-Band sind die Kanäle 1, 6 und {11} überlappungsfrei.
- Bei WPA-Enterprise prüft ein {RADIUS}-Server die Anmeldung.
- WPA3-Personal verwendet den Schlüsselaustausch {SAE}.

## Zuordnen
### Standard und Wi-Fi-Generation
- 802.11n => Wi-Fi 4
- 802.11ac => Wi-Fi 5
- 802.11ax => Wi-Fi 6
- 802.11be => Wi-Fi 7

### Sicherheitsverfahren und Bewertung
- WEP => unsicher, nicht verwenden
- WPA2-Personal => gemeinsamer Schlüssel, für kleine Umgebungen
- WPA3-Personal (SAE) => Schutz vor Offline-Wörterbuchangriffen
- WPA3-Enterprise => individuelle Anmeldung per 802.1X

### Frequenzband und Eigenschaft
- 2,4 GHz => große Reichweite, wenige Kanäle
- 5 GHz => viele Kanäle, teilweise DFS
- 6 GHz => breite Kanäle, nur WPA3

### 802.1X-Rolle und Gerät
- Supplicant => Notebook/Client
- Authenticator => Access Point oder Switch
- Authentication Server => RADIUS-Server (NPS)

## Reihenfolge
### WLAN-Projekt
1. Anforderungen aufnehmen (Fläche, Clients, Anwendungen)
2. Vorab-Planung mit Grundriss
3. Site Survey vor Ort
4. APs, PoE-Switches und Controller installieren
5. SSIDs, VLANs und Sicherheit konfigurieren
6. Validierungsmessung und Dokumentation

### 802.1X-Anmeldung
1. Client assoziiert sich mit dem Access Point
2. Access Point fordert die Identität an
3. Access Point leitet an den RADIUS-Server weiter
4. RADIUS-Server prüft Anmeldedaten und Richtlinie
5. Access-Accept und Schlüsselaustausch
6. Client erhält Zugang zum zugewiesenen VLAN

### Gäste-WLAN einrichten
1. Eigenes VLAN für Gäste anlegen
2. SSID „Gast“ dem VLAN zuordnen
3. Client-Isolation aktivieren
4. Firewall-Regel nur Richtung Internet
5. Captive Portal bzw. Voucher einrichten

## Freitext
- F: Vergleichen Sie 2,4 GHz und 5 GHz hinsichtlich Reichweite, Kanalanzahl und Störanfälligkeit. | M: 2,4 GHz: höhere Reichweite/Durchdringung, nur 3 (bzw. 4) überlappungsfreie Kanäle, viele Störer. 5 GHz: geringere Reichweite, viele Kanäle, weniger Störer, höhere Datenraten, DFS in Teilbereichen. | P: 6
- F: Begründen Sie, warum ein Unternehmen WPA-Enterprise statt WPA-Personal einsetzen sollte. | M: Individuelle Anmeldung, einzelne Benutzer/Geräte sperrbar, kein gemeinsames Kennwort, das beim Ausscheiden geändert werden muss, VLAN-Zuweisung per RADIUS, Protokollierung. | P: 4
- F: Nennen Sie vier Maßnahmen zur Absicherung eines Gäste-WLANs. | M: Eigenes VLAN, Client-Isolation, Firewall nur Internet, Captive Portal/Voucher mit Nutzungsbedingungen, Bandbreitenbegrenzung, WPA3/OWE-Verschlüsselung, Protokollierung gemäß Recht. | P: 4

## Szenario
### Lagerhalle mit Handscannern
Eine Lagerhalle (80 × 40 m, Hochregale aus Metall) soll WLAN für 30 Handscanner und Tablets erhalten. Die Scanner unterstützen nur 2,4 GHz.
- F: Welche Besonderheiten beachten Sie bei der Planung? | A: Metallregale dämpfen/reflektieren – Site Survey zwingend, APs zwischen den Regalgassen, 2,4-GHz-Kanalplan 1/6/11, Roaming-Überlappung. | P: 3
- F: Wie versorgen Sie die APs an der Hallendecke mit Strom? | A: Per PoE (802.3at/bt) über das Netzwerkkabel aus einem PoE-Switch. | P: 1

### Mitarbeiter verlässt das Unternehmen
Das Büro nutzt WPA2-Personal mit einem gemeinsamen Kennwort. Ein Mitarbeiter wurde fristlos gekündigt.
- F: Welches Problem entsteht? | A: Er kennt den Schlüssel; zum Aussperren müsste das Kennwort auf allen Geräten geändert werden. | P: 2
- F: Welche dauerhafte Lösung schlagen Sie vor? | A: WPA2/WPA3-Enterprise mit 802.1X und RADIUS (NPS), Anmeldung per Benutzerkonto oder Zertifikat; Konto sperren genügt. | P: 3

### Langsames WLAN im Besprechungsraum
In einem Besprechungsraum mit 40 Teilnehmern ist das WLAN sehr langsam, obwohl das Signal voll ist.
- F: Was ist die wahrscheinliche Ursache? | A: Kapazitätsproblem – zu viele Clients teilen sich eine Funkzelle (geteiltes Medium). | P: 2
- F: Welche Maßnahmen helfen? | A: Weiteren AP im Raum, Clients auf 5/6 GHz lenken (Band Steering), geringere Kanalbreite in dichten Umgebungen, Sendeleistung anpassen. | P: 3
