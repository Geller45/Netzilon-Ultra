---
id: ccna-wlan-grundlagen
bereich: CCNA
block: CCNA 1.11
kapitel: Network Fundamentals
titel: WLAN-Grundlagen – RF, Bänder, Kanäle, SSID, BSS/ESS, 802.11-Standards
stufe: Fortgeschritten
fach: TCP/IP – CCNA – Basic
pruefungen: [CCNA, AP1, AP2]
quellen: [CCNA_200-301_Notes_-_Jeremys_IT_Lab.pdf, WiFi.md, OSI 1.md, 200-301.pdf]
verweise: [ccna-wlan-architektur, ccna-wlan-sicherheit, ap1-a4-topologie, ccna-kabel-schnittstellen]
---

## Profi

### Besonderheiten von Funknetzen
WLAN-Standards definiert **IEEE 802.11**; „**Wi-Fi**“ ist eine Marke der **Wi-Fi Alliance**, die Geräte auf Interoperabilität testet und zertifiziert (Wi-Fi 4/5/6/6E/7, WPA2/WPA3).
1. **Alle Geräte in Reichweite empfangen alle Frames** (wie an einem Hub) → Vertraulichkeit ist wichtig, Medium ist **halbduplex** → Zugriff per **CSMA/CA** (Collision **Avoidance**): vor dem Senden lauschen, zufällige Wartezeit, optional **RTS/CTS**; jeder Unicast-Frame wird mit **ACK** bestätigt.
2. Funk ist **reguliert** (in Deutschland Bundesnetzagentur, EU: ETSI); 2,4/5/6 GHz sind **lizenzfrei** (ISM/U-NII), aber mit Leistungsgrenzen.
3. **Signalausbreitung**: **Absorption** (Wand, Wasser, Körper → Wärme), **Reflexion** (Metall, Aufzug), **Refraktion/Brechung** (Glas, Wasser), **Beugung** (um Hindernisse), **Streuung** (Staub, raue Flächen).
4. **Interferenz** durch andere WLANs auf denselben Kanälen, Mikrowellen, Bluetooth.

### Radiofrequenz (RF)
Wechselstrom an einer Antenne erzeugt elektromagnetische Wellen. **Amplitude** = maximale Feldstärke, **Frequenz** = Schwingungen pro Sekunde in **Hertz** (kHz, MHz, GHz), **Periode** = Zeit einer Schwingung (4 Hz → 0,25 s). Radiofrequenzbereich ca. 30 Hz – 300 GHz.

### Bänder und Kanäle
| Band | Bereich | Eigenschaft |
|---|---|---|
| **2,4 GHz** | 2,400–2,4835 GHz | größere Reichweite, bessere Durchdringung, aber viele Störer; Kanäle 22 MHz breit, **nur 3 überschneidungsfrei: 1, 6, 11** (in Europa auch 1/5/9/13 bei 20 MHz) |
| **5 GHz** | 5,150–5,825 GHz (4 Teilbänder) | viele **überschneidungsfreie** 20-MHz-Kanäle, Kanalbündelung 40/80/160 MHz, kürzere Reichweite, DFS in Teilbändern |
| **6 GHz** | 5,925–7,125 GHz (EU: bis 6,425 GHz) | ab **Wi-Fi 6E**, sehr viele breite Kanäle, nur WPA3 |
**Wabenmuster** (Honeycomb): benachbarte APs auf Kanal 1, 6, 11 → flächendeckend ohne Überlappung.

### 802.11-Standards
| Standard | Wi-Fi-Name | Jahr | Band | max. Datenrate (theor.) |
|---|---|---|---|---|
| 802.11 | – | 1997 | 2,4 | 2 Mbit/s |
| 802.11b | – | 1999 | 2,4 | 11 Mbit/s |
| 802.11a | – | 1999 | 5 | 54 Mbit/s |
| 802.11g | – | 2003 | 2,4 | 54 Mbit/s |
| 802.11n | **Wi-Fi 4** (HT) | 2009 | 2,4/5 | 600 Mbit/s |
| 802.11ac | **Wi-Fi 5** (VHT) | 2013 | 5 | ca. 6,9 Gbit/s |
| 802.11ax | **Wi-Fi 6 / 6E** (HE) | 2019/2021 | 2,4/5(/6) | ca. 9,6 Gbit/s |
| 802.11be | **Wi-Fi 7** (EHT) | 2024 | 2,4/5/6 | ca. 46 Gbit/s |
Techniken: **OFDM** (viele Unterträger parallel), **MIMO** (mehrere Antennen, Spatial Streams), **MU-MIMO**, **OFDMA** (ab Wi-Fi 6), Kanalbreite, Modulation (QAM), **Guard Interval**. Datenrate hängt von **Signalqualität** ab (schlechtes Signal → niedrigere Modulation).

### Service Sets
| Begriff | Bedeutung |
|---|---|
| **SSID** | Service Set Identifier – lesbarer Netzname (max. 32 Zeichen), nicht eindeutig |
| **BSSID** | MAC-Adresse des AP-Radios – eindeutige Kennung eines BSS |
| **BSS** | Basic Service Set: ein AP mit seinen Clients; **BSA** = Abdeckungsbereich |
| **IBSS** | Independent BSS = **Ad-hoc**: Clients direkt ohne AP |
| **ESS** | Extended Service Set: mehrere BSS mit **gleicher SSID**, verbunden über ein Distribution System → **Roaming**; Zellen sollten sich **10–15 %** überlappen, verschiedene Kanäle |
| **MBSS** | Mesh Basic Service Set: Mesh-APs verbinden sich per Funk, Root-AP am Kabel |
| **DS** | Distribution System: kabelgebundenes Netz hinter dem AP (AP mappt SSID auf VLAN) |
Weitere AP-Betriebsarten (autonom): **Repeater** (ein Radio: gleicher Kanal, halber Durchsatz; zwei Radios: anderer Kanal), **Workgroup Bridge** (WLAN-Client für kabelgebundene Geräte), **Outdoor Bridge** (Punkt-zu-Punkt/Mehrpunkt zwischen Gebäuden, Richtantennen).

### 802.11-Frames
Typen: **Management** (Beacon, Probe Request/Response, Authentication, Association), **Control** (RTS, CTS, ACK), **Data**. Der 802.11-Header hat bis zu **vier Adressfelder** (Quelle, Ziel, Sender, Empfänger/BSSID). Verbindungsaufbau: **Probe → Authentication → Association**; passiv über **Beacons**, aktiv über Probe Requests.

## Einfach

WLAN ist wie **Reden in einer großen Halle**: Jeder hört jeden. Deshalb gilt:
- Nur **einer** darf gleichzeitig reden. Bevor man spricht, horcht man kurz, ob es ruhig ist, und wartet eine Zufallszeit (**CSMA/CA**). So stoßen Worte seltener zusammen.
- Weil alle mithören, muss man **in Geheimsprache** reden (Verschlüsselung WPA2/WPA3).

Es gibt verschiedene **Funk-Spuren** (Bänder):
- **2,4 GHz** ist wie eine **tiefe Stimme**: kommt durch Wände und weit, aber es ist **laut und voll** (viele Geräte, auch Mikrowellen). Nur **drei Kanäle (1, 6, 11)** stören sich nicht gegenseitig.
- **5 GHz** und **6 GHz** sind wie **helle Stimmen**: nicht so weit, aber **viel mehr freie Kanäle** und schneller.

Die **SSID** ist der **Name des WLANs** („Schule-WLAN“). Ein **Access Point** mit seinen Geräten ist ein **BSS** – wie ein Lehrer mit seiner Klasse. Viele Access Points mit **demselben Namen** bilden ein **ESS** – du kannst durchs ganze Schulhaus laufen und bleibst verbunden (**Roaming**). Damit sich die Lehrer nicht gegenseitig übertönen, sprechen Nachbar-APs auf **verschiedenen Kanälen**.

**Ad-hoc** heißt: Zwei Handys reden direkt miteinander, ganz ohne Access Point.

## Merksatz
- **2,4 GHz: 1 – 6 – 11.**
- **Wi-Fi 4 = n, 5 = ac, 6 = ax, 7 = be.**
- **SSID = Name, BSSID = AP-MAC.**
- **BSS = 1 AP, ESS = viele APs gleiche SSID, IBSS = ad hoc.**
- **WLAN = CSMA/CA, Kabel-Ethernet (Hub) = CSMA/CD.**

## Prüfungsfalle
- **Nicht überlappend im 2,4-GHz-Band sind 1, 6, 11** – nicht 1, 5, 10.
- Die **SSID** ist **kein** Sicherheitsmerkmal (Verstecken hilft nicht).
- Obsidian-Notiz „WiFi“: „802.11ac ab 2014, 6,77 Gb/s“ – Standard ist **2013** verabschiedet, theoretisch ca. **6,9 Gbit/s**. „In einem Bereich maximal 14 Kanäle“ – 2,4 GHz hat zwar bis 14 Kanäle (14 nur Japan), aber nur **drei überschneidungsfreie**. „160 MHz – Unterstützung nicht notwendig“ ist missverständlich: 80 MHz ist bei 802.11ac Pflicht, **160 MHz optional**.
- WLAN ist auf L1 **und** L2 definiert (802.11 PHY und MAC).
- 2,4 GHz hat **größere** Reichweite als 5 GHz.

## Grafik
### Verbindung eines Clients
1. AP1 -> Laptop: Beacon „SSID Schule“ (passiv)
2. Laptop -> AP1: Probe Request
3. AP1 -> Laptop: Probe Response
4. Laptop -> AP1: Authentication (Open/SAE)
5. AP1 -> Laptop: Authentication Response
6. Laptop -> AP1: Association Request
7. AP1 -> Laptop: Association Response – verbunden

### Kanalplanung als Waben
1. Text: Raster mit Waben erscheint
2. AP1: Kanal 1 (blau)
3. AP2: Kanal 6 (grün) neben AP1
4. AP3: Kanal 11 (orange) neben beiden
5. Text: Gleiche Farben berühren sich nicht – keine Gleichkanalstörung

## Lab
**Packet Tracer: Home Router (WRT300N) bzw. AP-PT, Laptop mit WLAN-Karte**

### GUI
1. **AP1** → Config → Port 1 → SSID `Schule-WLAN`, Kanal **6**, Authentication **WPA2-PSK**, Passphrase (mind. 8 Zeichen), Verschlüsselung AES.
2. **Laptop1** → Physical → Netzwerkkarte gegen WLAN-Modul (WPC300N) tauschen.
3. **Laptop1** → Desktop → PC Wireless → Connect → `Schule-WLAN` wählen → Passphrase.
4. Zweiten AP mit **gleicher SSID** auf Kanal **11** aufstellen → Laptop verschieben → Roaming beobachten (ESS).

### Windows 11 (echter PC)
1. Eingabeaufforderung: `netsh wlan show interfaces` – SSID, BSSID, Kanal, Funktyp (802.11ax), Signal.
2. `netsh wlan show networks mode=bssid` – alle sichtbaren BSSIDs mit Kanälen.

## Befehle
- `netsh wlan show interfaces` – aktuelle WLAN-Verbindung (Windows)
- `netsh wlan show networks mode=bssid` – sichtbare Netze, BSSIDs, Kanäle
- `iw dev wlan0 link` – WLAN-Verbindung (Linux)
- `nmcli dev wifi list` – Netze anzeigen (Linux)

## Übungen
- A: Welche Kanäle nutzt man im 2,4-GHz-Band für drei benachbarte APs? | L: 1, 6 und 11.
- A: Unterschied BSS und ESS? | L: BSS = ein AP mit Clients; ESS = mehrere BSS mit gleicher SSID über ein Distribution System, ermöglicht Roaming.
- A: Warum ist die Reichweite bei 2,4 GHz größer als bei 5 GHz? | L: Niedrigere Frequenz wird weniger stark gedämpft/absorbiert und durchdringt Hindernisse besser.
- A: Wie groß sollte die Zellüberlappung in einem ESS sein? | L: Etwa 10–15 %.
- A: Frequenz 4 Hz – wie lang ist die Periode? | L: 1/4 s = 0,25 s.

## Karteikarten
- F: Welcher IEEE-Standard definiert WLAN? | A: IEEE 802.11.
- F: Welches Zugriffsverfahren nutzt WLAN? | A: CSMA/CA (Collision Avoidance).
- F: Welche 2,4-GHz-Kanäle sind überschneidungsfrei? | A: 1, 6 und 11.
- F: Was ist eine SSID? | A: Der Name des WLANs (max. 32 Zeichen).
- F: Was ist eine BSSID? | A: Die MAC-Adresse des AP-Radios, eindeutige Kennung eines BSS.
- F: Was ist ein IBSS? | A: Ad-hoc-Netz ohne Access Point.
- F: Was ist ein ESS? | A: Mehrere BSS mit gleicher SSID, verbunden über ein Distribution System.
- F: Wi-Fi 6 entspricht welchem Standard? | A: 802.11ax.
- F: Was ist MIMO? | A: Multiple Input Multiple Output – mehrere Antennen für parallele Datenströme.
- F: Welche Signaleffekte schwächen WLAN? | A: Absorption, Reflexion, Refraktion, Beugung, Streuung, Interferenz.
- F: Welche drei 802.11-Frame-Typen gibt es? | A: Management, Control, Data.

## Quiz
? Welche Kanäle im 2,4-GHz-Band überlappen sich nicht?
* 1, 6, 11
- 1, 5, 10
- 2, 7, 12
- 1, 7, 13

? Welches Zugriffsverfahren verwenden WLANs?
* CSMA/CA
- CSMA/CD
- Token Passing
- TDMA

? Was beschreibt die BSSID?
* Die MAC-Adresse des Access-Point-Radios
- Den Namen des WLANs
- Die IP-Adresse des WLC
- Die VLAN-ID des WLANs

? Welcher Standard heißt Wi-Fi 5?
* 802.11ac
- 802.11n
- 802.11ax
- 802.11g

? Mehrere APs nutzen dieselbe SSID und ermöglichen Roaming. Wie heißt das?
* ESS
- IBSS
- BSS
- MBSS

? Welche Eigenschaft hat das 5-GHz-Band gegenüber 2,4 GHz?
* Mehr überschneidungsfreie Kanäle, aber geringere Reichweite
- Größere Reichweite und bessere Wanddurchdringung
- Nur drei nutzbare Kanäle
- Es ist lizenzpflichtig

? Welcher Effekt erklärt schlechten WLAN-Empfang im Aufzug?
* Reflexion an Metall
- Refraktion an Glas
- Streuung durch Staub
- Beugung um Ecken

? Was ist ein IBSS?
* Ein Ad-hoc-Netz zwischen Clients ohne AP
- Mehrere APs mit gleicher SSID
- Ein Mesh-Netz mit Root-AP
- Ein AP mit mehreren SSIDs

## Zuordnen
### Standard und Wi-Fi-Name
- 802.11n => Wi-Fi 4
- 802.11ac => Wi-Fi 5
- 802.11ax => Wi-Fi 6/6E
- 802.11be => Wi-Fi 7

## Spickzettel
- 802.11, CSMA/CA, halbduplex, ACK je Frame
- 2,4 GHz: 1/6/11, weit · 5 GHz: viele Kanäle · 6 GHz: Wi-Fi 6E/7, nur WPA3
- n = 4, ac = 5, ax = 6, be = 7
- SSID Name · BSSID AP-MAC · BSS/ESS/IBSS/MBSS
- Probe → Authentication → Association
