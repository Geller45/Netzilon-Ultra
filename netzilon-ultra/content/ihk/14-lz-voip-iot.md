---
id: ihk-lz-voip-iot
bereich: Prüfung
block: IHK
kapitel: Lernzettel-Inhalte
titel: Multimedia, VoIP, QoS und IoT (MQTT)
stufe: Fortgeschritten
fach: PV – AP2
pruefungen: [AP2]
quellen: [Multimedia, VoIP & IoT.docx, Multimedia, VoIP & IoT.pdf, Lernzettel_AP1AP2_2024.pdf, Protokolle.docx]
verweise: [ihk-berechnungen-lernzettel, ihk-lz-vlan-wlan-ipv6, ihk-lz-protokolle]
---

## Profi

### VoIP
- **Bandbreite** = Codec-Bitrate × Anzahl Gespräche × (1 + Overhead). Beispiel (Lernzettel): G.722 64 kbit/s, 20 Gespräche, 10 % Overhead → 20 × 64 × 1,1 = **1.408 kbit/s**.
- **VoIP-VLAN**: Trennung von Sprache und Daten → gezielte **QoS**, mehr Sicherheit (Telefone nicht aus dem Datennetz angreifbar).
- **Fax over IP**: nach ISDN-Umstellung unvollständige Faxe durch **Paketverlust** und **Jitter**, weil Faxprotokolle sehr zeitempfindlich sind (T.38/Passthrough).
- Protokolle: SIP (Signalisierung), RTP/SRTP (Sprache, UDP), Codecs (G.711 64 kbit/s, G.722, G.729 8 kbit/s). Qualitätsmerkmale: **Latenz** (< 150 ms), **Jitter**, **Paketverlust**.

### QoS und Multimedia
- Pakete werden markiert (DSCP/CoS) und bevorzugt weitergeleitet (E-Mail hat niedrigere Priorität als Audio).
- **Videokonferenz**: Audio hat Vorrang; bei Engpass sinkt die Videoauflösung (1080p → 720p) oder die **Bildrate (FPS)**. Bandbreite hängt von Layout, Auflösung und Teilnehmerzahl ab.

### IoT und MQTT
- **MQTT**: Publish/Subscribe über einen **Broker**; Ablauf: `CONNECT` → `CONNACK` → `PUBLISH` (Topic). Setzt auf **TCP** (zuverlässig, Bestätigung), Ports 1883 / 8883 (TLS).
- Einzelne Nachrichten klein (z. B. 66 Byte), aber 500 Sensoren × kurze Intervalle belasten ein IoT-WLAN: **Gesamtlast** = Nachrichtengröße × Anzahl × Frequenz. Beispiel 500 × 66 B × 8 = 264.000 bit je Sendezyklus; bei 1/s ≈ 264 kbit/s.
- Ältere Sensoren nur **2,4 GHz**: neue APs dürfen das Band nicht abschalten. IoT in eigenes VLAN/SSID.

### Übertragungsarten
**Unicast** 1:1, **Multicast** 1:n (IPv4 224.0.0.0–239.255.255.255, binär 1110…), **Broadcast** 1:alle (Subnetz), **Anycast** (nächster Empfänger, IPv6).

### Einheiten umrechnen
MiB → Bit: × 1024 × 1024 × 8. Zeit = Bits : Bit/s, auf volle Sekunden aufrunden. Beispiel 150 MiB über 50 Mbit/s: 150 × 1.048.576 × 8 = 1.258.291.200 bit : 50.000.000 = 25,17 s → **26 s**.

## Einfach

**Telefonieren übers Internet (VoIP):** Deine Stimme wird in kleine Päckchen verpackt und durchs Netz geschickt. Damit niemand ruckelt oder hängt, braucht jedes Gespräch eine bestimmte Geschwindigkeit: etwa 64 kbit/s pro Gespräch. Bei 20 Gesprächen gleichzeitig sind das 1.280 kbit/s, plus 10 % für die Verpackung (Overhead) = 1.408 kbit/s.

**Warum eigenes VLAN?** Stell dir eine Straße vor, auf der Lastwagen (Dateien) und Krankenwagen (Sprache) fahren. QoS ist die Regel: „Krankenwagen haben Vorfahrt.“ Mit einem eigenen VLAN fahren Krankenwagen auf ihrer eigenen Spur.

**Faxe haben es schwer:** Ein Fax braucht einen perfekten, gleichmäßigen Datenstrom. Wenn Pakete verloren gehen oder zu ungleichmäßig ankommen (Jitter), entstehen Streifen oder das Fax bricht ab.

**Videokonferenz:** Wenn das Netz zu langsam ist, opfert der Computer erst das Bild (schlechtere Qualität, weniger Bilder pro Sekunde) und hält den Ton aufrecht. Denn man kann ein pixeliges Bild verstehen, aber keinen zerhackten Ton.

**IoT und MQTT:** Sensoren (z. B. Temperatur) sind klein und schicken kurze Nachrichten: „Es sind 21 Grad.“ MQTT funktioniert wie eine Zeitung: Der Sensor „veröffentlicht“ (Publish) beim Broker (Zeitungsverlag), und wer sich dafür interessiert, hat die Zeitung abonniert (Subscribe). TCP sorgt dafür, dass jede Nachricht sicher ankommt. Viele kleine Nachrichten können zusammen aber doch viel Verkehr machen: 500 Sensoren mal jede Sekunde.

**Unicast, Multicast, Broadcast:** Unicast = Brief an eine Person. Multicast = Newsletter an Abonnenten. Broadcast = Durchsage an alle im Haus.

**Dateien laden:** MiB × 1024 × 1024 × 8 = Bits. Dann durch die Geschwindigkeit teilen.

## Merksatz
- VoIP-Bandbreite = Bitrate × Gespräche × 1,1.
- Audio vor Video, Video verliert zuerst Qualität.
- MQTT = Publish/Subscribe über TCP.
- Multicast 224–239.
- Fax braucht wenig Jitter.

## Prüfungsfalle
- Overhead nicht vergessen (×1,1).
- MQTT nutzt TCP, nicht UDP.
- Multicast ist nicht Broadcast: nur Gruppenmitglieder.
- MiB/MB und Bit/Byte sauber trennen.
- QoS verbessert nicht die Gesamtbandbreite, sie priorisiert nur.

## Grafik
### MQTT Publish/Subscribe
1. Sensor -> Broker: CONNECT
2. Broker -> Sensor: CONNACK
3. Sensor -> Broker: PUBLISH Topic halle1/temperatur = 21
4. Dashboard -> Broker: SUBSCRIBE halle1/temperatur
5. Broker -> Dashboard: Nachricht weiterleiten

## Spickzettel
- VoIP: Rate × Gespräche × 1,1
- QoS: Audio vor Video
- MQTT: Publish/Subscribe, TCP, CONNECT/CONNACK
- Multicast 224.0.0.0–239.255.255.255
- Fax-over-IP: Jitter, Paketverlust

## Karteikarten
- F: Bandbreite für 20 Gespräche à 64 kbit/s mit 10 % Overhead? | A: 1.408 kbit/s
- F: Wozu ein VoIP-VLAN? | A: QoS für Sprache und Trennung vom Datenverkehr
- F: Ursache gestörter Faxe über VoIP? | A: Paketverlust und Jitter
- F: Was priorisiert QoS? | A: Zeitkritische Pakete wie Sprache
- F: Was wird bei Videokonferenz bei Engpass reduziert? | A: Auflösung oder Bildrate (Audio bleibt)
- F: MQTT-Prinzip? | A: Publish/Subscribe über Broker, TCP
- F: MQTT-Verbindungsaufbau? | A: CONNECT, CONNACK, dann PUBLISH
- F: IPv4-Multicast-Bereich? | A: 224.0.0.0 bis 239.255.255.255
- F: Unicast/Multicast/Broadcast? | A: 1:1, 1:n (Gruppe), 1:alle
- F: Warum 2,4 GHz bei IoT beachten? | A: Ältere Sensoren unterstützen nur dieses Band

## Quiz
? Wie hoch ist die Bandbreite für 10 Gespräche à 64 kbit/s ohne Overhead?
* 640 kbit/s
- 64 kbit/s
- 6.400 kbit/s
- 1.280 kbit/s

? Wozu dient QoS?
* Zeitkritische Pakete bevorzugen
- Pakete verschlüsseln
- Adressen vergeben
- Pakete komprimieren

? Welches Transportprotokoll nutzt MQTT?
* TCP
- UDP
- ICMP
- ARP

? Was wird bei Bandbreitenmangel in der Videokonferenz zuerst reduziert?
* Videoauflösung oder Bildrate
- Audio
- Teilnehmerzahl
- Verschlüsselung

? Welche Adresse ist eine IPv4-Multicast-Adresse?
* 239.1.1.1
- 192.168.1.1
- 10.0.0.255
- 169.254.1.1

? Warum scheitern Faxe über VoIP häufig?
* Paketverlust und Jitter
- Zu viel Bandbreite
- Zu starkes Signal
- Fehlende IPv6-Adresse

? Wie lautet das Prinzip von MQTT?
* Publish/Subscribe
- Request/Response
- Broadcast
- Peer-to-Peer ohne Broker

? Was bedeutet Multicast?
* Übertragung an eine Gruppe von Empfängern
- Übertragung an genau einen Empfänger
- Übertragung an alle Teilnehmer
- Übertragung an den nächsten Router

? 100 MiB werden über 80 Mbit/s übertragen. Wie lange etwa?
* ca. 11 s
- ca. 1 s
- ca. 80 s
- ca. 100 s
! 100 × 1.048.576 × 8 = 838.860.800 bit : 80.000.000 = 10,49 s, aufgerundet 11 s.
