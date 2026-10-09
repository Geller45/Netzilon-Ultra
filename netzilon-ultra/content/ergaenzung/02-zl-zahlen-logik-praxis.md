---
id: erg-zahlen-logik-praxis
bereich: AP1
block: ERG
kapitel: Ergänzungen 2.2
titel: Zahlensysteme und Logik in der Admin-Praxis – Bitmasken, Rechte, Farben, Datenmengen
stufe: Einsteiger
fach: ITK / Grundlagen
pruefungen: [AP1]
quellen: [IHK-Prüfungskatalog FiSi AP1 (Zahlensysteme, Logik, Einheiten), IEC 80000-13 (Binärpräfixe), eigene Übungsaufgaben]
verweise: [ap1-a3-zahlensysteme, ap1-a3-rechnen, ap1-a3-logik, ap1-a3-binaerpraefixe, ap1-a4-subnetting, linux-101-104-5-rechte, netz-ascii-code]
---

## Profi

### Warum Admins Zahlensysteme brauchen
Zahlensysteme sind kein Selbstzweck: Sie stecken in **Subnetzmasken** (binär), **MAC- und IPv6-Adressen** (hexadezimal), **Linux-Rechten** (oktal), **Farbcodes** im Web (hexadezimal) und in **Speicher- und Übertragungsberechnungen** (Binärpräfixe).

| System | Basis | Ziffern | Praxisbeispiel |
|---|---|---|---|
| Dual (binär) | 2 | 0, 1 | 255.255.255.0 = 11111111.11111111.11111111.00000000 |
| Oktal | 8 | 0–7 | `chmod 750` = rwx r-x --- |
| Dezimal | 10 | 0–9 | IPv4-Darstellung 192.168.1.10 |
| Hexadezimal | 16 | 0–9, A–F | MAC 00:1A:2B:3C:4D:5E, IPv6 2001:db8::1, Farbe #FF8800 |

**Umrechnungstricks**: Ein Hex-Zeichen = **4 Bit** (Nibble), ein Oktal-Zeichen = **3 Bit**. Deshalb lässt sich binär ↔ hex durch Vierergruppen, binär ↔ oktal durch Dreiergruppen umrechnen, ohne über Dezimal zu gehen.

### Bitmasken und logische Verknüpfung
- **UND (AND)**: Ergebnis 1 nur, wenn beide Bits 1 sind. Anwendung: **IP-Adresse AND Subnetzmaske = Netzadresse**.
- **ODER (OR)**: Ergebnis 1, wenn mindestens ein Bit 1 ist. Anwendung: Bits gezielt **setzen** (z. B. Rechte hinzufügen).
- **XOR (Exklusiv-ODER)**: Ergebnis 1, wenn die Bits **unterschiedlich** sind. Anwendung: **RAID-5-Parität**, einfache Prüfsummen, Bits umschalten.
- **NICHT (NOT)**: invertiert. Anwendung: **Wildcard-Maske** (Cisco-ACL, OSPF) = invertierte Subnetzmaske, z. B. 0.0.0.255.

Beispiel Netzadresse: 192.168.10.**77** AND 255.255.255.**192** → letztes Oktett 01001101 AND 11000000 = 01000000 = **64** → Netz 192.168.10.64/26.

### Linux-Rechte oktal
Jede Rechtegruppe (Besitzer, Gruppe, Andere) besteht aus 3 Bit: **r = 4, w = 2, x = 1**. `chmod 640 datei` = Besitzer rw- (6), Gruppe r-- (4), Andere --- (0). Die **umask** wird von den Standardrechten (Dateien 666, Verzeichnisse 777) bitweise „abgezogen“ (genauer: AND NOT). umask 022 → Dateien 644, Verzeichnisse 755.

### Datenmengen und Übertragungszeiten
- **Dezimalpräfixe** (SI): 1 kB = 1.000 Byte, 1 MB = 10⁶ Byte, 1 GB = 10⁹ Byte – Festplattenhersteller, Datenraten.
- **Binärpräfixe** (IEC): 1 KiB = 1.024 Byte, 1 MiB = 1.024² Byte, 1 GiB = 1.024³ Byte – Arbeitsspeicher, Betriebssystemanzeige.
- **Übertragungszeit** = Datenmenge in **Bit** ÷ Datenrate in **Bit/s**. Byte × 8 = Bit nicht vergessen!

Beispiel: 6 GB (Dezimal) über 100 Mbit/s → 6 × 10⁹ × 8 Bit ÷ 100 × 10⁶ Bit/s = **480 s = 8 min**.

## Einfach
Computer kennen nur **an** und **aus** – also 1 und 0. Das ist das **Dualsystem**. Weil lange Reihen aus Nullen und Einsen schwer zu lesen sind, fassen Menschen sie zusammen: **vier Bits** werden zu **einem Hex-Zeichen** (0 bis F), **drei Bits** zu **einer Oktalziffer** (0 bis 7). Das ist wie Kleingeld: Statt 100 Ein-Cent-Münzen nimmst du einen Euro.

Wo begegnet dir das als Admin?
- Die **MAC-Adresse** deiner Netzwerkkarte ist hexadezimal: 00:1A:2B…
- Die **Rechte** einer Linux-Datei schreibst du oktal: 7 heißt „lesen, schreiben, ausführen“ (4 + 2 + 1).
- Die **Subnetzmaske** ist eigentlich eine Reihe von Einsen und Nullen. Die Einsen sagen: „Das ist der Teil für das Netz“.

Die **Logik** funktioniert wie Lichtschalter:
- **UND**: Die Lampe brennt nur, wenn **beide** Schalter an sind.
- **ODER**: Die Lampe brennt, wenn **irgendein** Schalter an ist.
- **XOR**: Die Lampe brennt nur, wenn die Schalter **verschieden** stehen – wie beim Treppenhauslicht mit zwei Schaltern.
- **NICHT**: dreht alles um.

Und bei **Datenmengen** musst du aufpassen: Ein Byte sind 8 Bit. Internetgeschwindigkeit wird in **Bit** pro Sekunde angegeben, Dateigrößen in **Byte**. Wenn du ausrechnen willst, wie lange ein Download dauert, musst du die Dateigröße erst mit 8 malnehmen. Sonst bist du achtmal zu optimistisch!

## Merksatz
- **1 Hex = 4 Bit, 1 Oktal = 3 Bit.**
- **IP AND Maske = Netz.** Wildcard = NOT Maske.
- **r = 4, w = 2, x = 1** – chmod 755 = rwxr-xr-x.
- **XOR = verschieden ergibt 1** – Grundlage der RAID-5-Parität.
- **Bit × 8 = Byte? Nein: Byte × 8 = Bit!**

## Prüfungsfalle
- Datenrate in **Mbit/s**, Datei in **MB**: Faktor 8 vergessen ist der häufigste Fehler.
- **GB (10⁹) ≠ GiB (2³⁰)**: Eine „1-TB-Platte“ zeigt Windows als ca. 931 „GB“ (eigentlich GiB) an.
- Bei der umask wird nicht arithmetisch subtrahiert, sondern bitweise maskiert (bei 666 und umask 033 ergibt sich 644, nicht 633).
- Hex-Ziffer **F = 15**, nicht 16.
- Die Wildcard-Maske ist **nicht** dieselbe wie die Subnetzmaske.

## Grafik
### Netzadresse per UND
1. Host: IP 192.168.10.77 – letztes Oktett 01001101
2. Maske: /26 – letztes Oktett 11000000
3. Router: Bitweise UND – 01000000
4. Router: Ergebnis 64 – Netz 192.168.10.64/26
5. Router -> Ziel: Paket im eigenen Netz zustellen oder an Gateway senden

## Lab
**Maschinen**: Linux-Server **LX01** (Debian 12) und Windows-Client **CL01** im Heimlabor **example.com**.

### CLI (LX01)
```bash
printf '%x\n' 255        # dezimal -> hex: ff
echo $((16#FF))          # hex -> dezimal: 255
echo "obase=2; 192" | bc # dezimal -> binär: 11000000
touch test.txt; chmod 640 test.txt; stat -c '%a %A' test.txt
umask                    # aktuelle umask anzeigen
```

### PowerShell (CL01)
```powershell
[Convert]::ToString(192, 2)      # 11000000
[Convert]::ToInt32('FF', 16)     # 255
'{0:X}' -f 3000                  # BB8
77 -band 192                     # 64 (bitweises UND)
(6GB * 8) / 100MB                # Übertragungszeit-Näherung mit Binärpräfixen
```

## Legende
### Bitmaske
- Was: Ein Bitmuster, mit dem per UND/ODER/XOR gezielt Bits ausgewählt, gesetzt oder umgeschaltet werden.
- Wie: Wert und Maske bitweise verknüpfen, z. B. IP AND Subnetzmaske.
- Wann: Bei Subnetting, ACL-Wildcards, Dateirechten, Flags in Protokollen.
- Wo: Router, Firewalls, Betriebssysteme, Programmcode.
- Warum: Schnelle, eindeutige Auswertung einzelner Bits ohne Umweg über Dezimalzahlen.

### Binärpräfix
- Was: Vorsilben auf Basis 1.024 (KiB, MiB, GiB, TiB) nach IEC.
- Wie: 1 KiB = 2¹⁰ Byte, 1 MiB = 2²⁰ Byte, 1 GiB = 2³⁰ Byte.
- Wann: Bei Arbeitsspeicher und der Anzeige vieler Betriebssysteme.
- Wo: RAM-Angaben, Dateisystemgrößen, Prüfungsrechnungen mit Vorgabe.
- Warum: Unterscheidet eindeutig von Dezimalpräfixen (kB, MB, GB = Basis 1.000).

## Karteikarten
- F: Wie viele Bit stellt eine Hexadezimalziffer dar? | A: 4 Bit (ein Nibble).
- F: Wie viele Bit stellt eine Oktalziffer dar? | A: 3 Bit.
- F: Wie berechnet man die Netzadresse aus IP und Maske? | A: Bitweises UND (AND) von IP-Adresse und Subnetzmaske.
- F: Was ist eine Wildcard-Maske? | A: Die invertierte Subnetzmaske (NOT), z. B. 0.0.0.255 zu 255.255.255.0 – verwendet in Cisco-ACLs und OSPF.
- F: Was bedeutet chmod 754? | A: Besitzer rwx (7), Gruppe r-x (5), Andere r-- (4).
- F: Welche Rechte erhält eine neue Datei bei umask 027? | A: 640 (rw-r-----), da Dateien von 666 ausgehen und die Bits der umask entfernt werden.
- F: Wofür wird XOR in der IT genutzt? | A: RAID-5-Paritätsberechnung, Prüfsummen, Verschlüsselungsoperationen, Bits umschalten.
- F: Wie viele Byte hat 1 GiB? | A: 1.073.741.824 Byte (2³⁰).
- F: Formel für die Übertragungszeit? | A: Zeit = Datenmenge in Bit ÷ Datenrate in Bit/s.
- F: Was ist 0xFF dezimal und binär? | A: 255 bzw. 11111111.

## Quiz
? Welche Dezimalzahl entspricht 0x1F?
* 31
- 15
- 16
- 32
! 1 × 16 + 15 = 31.

? Welche logische Verknüpfung liefert aus IP-Adresse und Subnetzmaske die Netzadresse?
* UND (AND)
- ODER (OR)
- XOR
- NICHT (NOT)
! Nur Bits, die in IP und Maske 1 sind, bleiben 1 – das ist der Netzanteil.

? Was ergibt 1 XOR 1?
* 0
- 1
- 2
- undefiniert
! XOR liefert nur bei unterschiedlichen Eingängen eine 1.

? Welche Rechte hat eine Datei mit chmod 640?
* rw-r-----
- rwxr-x---
- rw-rw-r--
- r--r-----
! 6 = rw-, 4 = r--, 0 = ---.

? Wie lange dauert die Übertragung von 3 GB (dezimal) bei 60 Mbit/s ohne Overhead?
* 400 Sekunden
- 50 Sekunden
- 3.200 Sekunden
- 20 Sekunden
! 3 × 10⁹ × 8 Bit = 24 × 10⁹ Bit; ÷ 60 × 10⁶ Bit/s = 400 s.

? Welche Wildcard-Maske gehört zur Subnetzmaske 255.255.255.224?
* 0.0.0.31
- 0.0.0.32
- 0.0.0.224
- 255.255.255.31
! Wildcard = 255.255.255.255 − Maske.

? In welchem Zahlensystem wird eine MAC-Adresse üblicherweise notiert?
* Hexadezimal
- Oktal
- Dezimal
- Binär
! 48 Bit = 12 Hex-Zeichen, meist in Paaren getrennt.

? Eine Festplatte mit „2 TB“ wird im Betriebssystem kleiner angezeigt. Warum?
* Der Hersteller rechnet dezimal (10¹²), das Betriebssystem binär (2⁴⁰).
- Ein Teil ist für das BIOS reserviert.
- Die Platte ist defekt.
- Das Dateisystem komprimiert die Daten.
! 2 × 10¹² Byte ≈ 1,82 TiB.

? Welche Binärzahl entspricht der Dezimalzahl 200?
* 11001000
- 11000100
- 10101000
- 11101000
! 128 + 64 + 8 = 200.

## Lücken
- Eine Hexadezimalziffer entspricht {4} Bit, eine Oktalziffer {3} Bit.
- IP-Adresse UND Subnetzmaske ergibt die {Netzadresse|Netz-ID}.
- Bei Linux-Rechten steht r für {4}, w für {2} und x für {1}.
- Ein Byte besteht aus {8} Bit.
- Die RAID-5-Parität wird mit der Verknüpfung {XOR|Exklusiv-ODER} berechnet.

## Zuordnen
### Zahlensystem und Praxisbeispiel
- Hexadezimal => MAC-Adresse und IPv6-Adresse
- Oktal => Linux-Dateirechte mit chmod
- Binär => Subnetzmaske bitweise
- Dezimal => IPv4-Punktnotation

### Logikfunktion und Anwendung
- UND => Netzadresse berechnen
- ODER => Bits gezielt setzen
- XOR => RAID-5-Parität
- NICHT => Wildcard-Maske bilden

### Präfix und Wert
- 1 KiB => 1.024 Byte
- 1 kB => 1.000 Byte
- 1 MiB => 1.048.576 Byte
- 1 GB => 1.000.000.000 Byte

## Reihenfolge
### Übertragungszeit berechnen
1. Datenmenge mit Einheit notieren
2. Präfix in Byte umrechnen (dezimal oder binär laut Aufgabe)
3. Byte mit 8 multiplizieren
4. Datenrate in Bit/s umrechnen
5. Datenmenge durch Datenrate teilen
6. Ergebnis in sinnvolle Einheit (Minuten/Stunden) umrechnen

### Dezimal in Binär (Restwertmethode)
1. Zahl durch 2 teilen
2. Rest (0 oder 1) notieren
3. Mit dem ganzzahligen Ergebnis weiter teilen, bis 0 erreicht ist
4. Reste von unten nach oben lesen

### Binär in Hexadezimal
1. Binärzahl von rechts in Vierergruppen teilen
2. Links mit Nullen auffüllen
3. Jede Gruppe in einen Wert 0–15 umrechnen
4. Werte 10–15 als A–F schreiben

## Freitext
- F: Erläutern Sie den Unterschied zwischen 1 GB und 1 GiB und nennen Sie je ein Einsatzgebiet. | M: GB = 10⁹ Byte (Dezimalpräfix, z. B. Festplattenhersteller, Datenraten), GiB = 2³⁰ = 1.073.741.824 Byte (Binärpräfix, z. B. Arbeitsspeicher, Anzeige im Betriebssystem). | P: 4
- F: Berechnen Sie die Netzadresse von 10.20.30.200/27 und zeigen Sie den Rechenweg. | M: /27 → letztes Oktett der Maske 224 = 11100000; 200 = 11001000; AND → 11000000 = 192; Netzadresse 10.20.30.192. | P: 4
- F: Ein Benutzer soll eine Datei lesen und schreiben, seine Gruppe nur lesen, andere gar nichts. Geben Sie den chmod-Befehl an und begründen Sie die Zahl. | M: chmod 640 datei – 6 = 4 + 2 (rw) für Besitzer, 4 (r) für Gruppe, 0 für Andere. | P: 3

## Szenario
### Backup über die WAN-Leitung
Eine Außenstelle soll nachts 45 GB (dezimal) Daten in die Zentrale sichern. Die Leitung bietet 50 Mbit/s, davon sind nachts 80 % nutzbar.
- F: Wie lange dauert die Übertragung? | A: 45 × 10⁹ × 8 = 360 × 10⁹ Bit; nutzbar 40 × 10⁶ Bit/s; 9.000 s = 2,5 h. | P: 4
- F: Passt die Sicherung in ein Zeitfenster von 22 bis 2 Uhr? | A: Ja, 4 Stunden Fenster > 2,5 Stunden Übertragung. | P: 1

### Rechte auf dem Projektlaufwerk (Linux)
Auf LX01 liegt das Verzeichnis /srv/projekt. Besitzer: Projektleiter, Gruppe: projekt. Andere sollen keinen Zugriff haben, die Gruppe soll lesen und hineinwechseln dürfen.
- F: Welcher Oktalwert ist richtig? | A: 750 (rwx für Besitzer, r-x für Gruppe, --- für Andere). | P: 2
- F: Warum braucht die Gruppe auf einem Verzeichnis das x-Recht? | A: x auf Verzeichnissen erlaubt das Hineinwechseln (cd) und den Zugriff auf enthaltene Dateien. | P: 2

### ACL mit Wildcard
Ein Netzwerkadmin soll in einer Cisco-ACL das Netz 172.16.8.0/21 freigeben.
- F: Wie lautet die Wildcard-Maske? | A: /21 = 255.255.248.0 → Wildcard 0.0.7.255. | P: 2
- F: Welche logische Operation steckt dahinter? | A: NICHT (Invertierung) der Subnetzmaske. | P: 1
