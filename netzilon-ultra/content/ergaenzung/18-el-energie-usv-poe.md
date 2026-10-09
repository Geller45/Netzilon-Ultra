---
id: erg-energie-usv-poe
bereich: AP1
block: ERG
kapitel: Ergänzungen 2.2
titel: Energie im IT-Betrieb – Leistung, Stromkosten, USV-Dimensionierung, PoE-Budget und Effizienz
stufe: Fortgeschritten
fach: ITK / Grundlagen
pruefungen: [AP1, AP2]
quellen: [DIN EN IEC 62040-3 (USV-Klassifizierung), IEEE 802.3af/at/bt (PoE), IHK-Prüfungsaufgaben Stromkosten und USV, Green Grid – PUE]
verweise: [ap1-a2-netzteil, ap1-a2-usv, server-hw-rechenaufgaben, ihkp-usv-aufgaben, ihk-formelsammlung-uebungen, ihk-berechnungen-lernzettel, erg-it-arbeitsplatz]
---

## Profi

### Grundgrößen
- **Spannung U** in Volt (V), **Stromstärke I** in Ampere (A), **Widerstand R** in Ohm (Ω): **U = R × I** (ohmsches Gesetz).
- **Leistung P** in Watt (W): **P = U × I**.
- **Energie (Arbeit) W** in Wattstunden (Wh) bzw. Kilowattstunden (kWh): **W = P × t**.
- **Wirkungsgrad η** = abgegebene Leistung ÷ aufgenommene Leistung. Ein Netzteil mit 90 % Wirkungsgrad, das 450 W an die Komponenten liefert, nimmt 500 W aus dem Netz auf. Effizienzklassen z. B. **80 PLUS** (Bronze, Gold, Platinum, Titanium).
- Bei Wechselstrom unterscheidet man **Scheinleistung S** (VA), **Wirkleistung P** (W) und den **Leistungsfaktor** cos φ bzw. PF: **P = S × PF**. USV-Typenschilder nennen beide Werte, z. B. 1500 VA / 1350 W (PF 0,9).

### Stromkosten berechnen
Kosten = Leistung (kW) × Betriebsstunden × Preis je kWh.
Beispiel: Arbeitsplatz-PC mit 120 W, 8 h/Tag, 220 Arbeitstage, 0,35 €/kWh → 0,12 kW × 8 h × 220 = **211,2 kWh** → **73,92 €/Jahr**. Ein Server 24/7 mit 300 W: 0,3 × 8.760 = 2.628 kWh → 919,80 €/Jahr. Bei Rechenzentren beschreibt **PUE** (Power Usage Effectiveness) = Gesamtenergie ÷ Energie der IT-Geräte die Effizienz (ideal 1,0).

### USV (Unterbrechungsfreie Stromversorgung)
**Klassen nach DIN EN IEC 62040-3**:
| Klasse | Bauart | Eigenschaft |
|---|---|---|
| **VFD** | Offline/Standby | Last hängt am Netz, Umschaltung bei Ausfall (wenige ms) – Arbeitsplätze |
| **VI** | Line-Interactive | zusätzlich Spannungsregelung (AVR) – kleine Server, Netzwerkschränke |
| **VFI** | Online/Doppelwandler | Last immer über Wechselrichter, keine Umschaltzeit, filtert alle Netzfehler – Rechenzentrum |

**Dimensionierung**:
1. Leistung aller angeschlossenen Geräte (W bzw. VA) addieren.
2. **Reserve** einplanen (typisch 20–30 %) für Wachstum und Einschaltströme.
3. USV wählen, deren **Wirkleistung (W)** und **Scheinleistung (VA)** jeweils ausreichen.
4. **Überbrückungszeit** prüfen: vereinfacht t = Batterieenergie (Wh) × Wirkungsgrad ÷ Last (W). Beispiel: 2 Batterien 12 V / 9 Ah = 216 Wh; Last 400 W, η 0,9 → 216 × 0,9 ÷ 400 ≈ 0,49 h ≈ **29 Minuten** (theoretisch; real kürzer, da Batteriekapazität bei hohem Entladestrom sinkt und die USV nicht bis 0 % entlädt).
5. **Shutdown-Konzept**: USV per USB/Netzwerkkarte (SNMP) an Server/Hypervisor anbinden, damit diese bei niedrigem Akkustand **kontrolliert herunterfahren**.

### Power over Ethernet
| Standard | Typ | Leistung am Switch (PSE) | am Gerät (PD) |
|---|---|---|---|
| 802.3af | Typ 1 (PoE) | 15,4 W | 12,95 W |
| 802.3at | Typ 2 (PoE+) | 30 W | 25,5 W |
| 802.3bt | Typ 3 (PoE++) | 60 W | 51 W |
| 802.3bt | Typ 4 | 90 W | 71,3 W |
Das **PoE-Budget** eines Switches begrenzt die Summe der Portleistungen. Beispiel: 10 Access Points (PoE+, 30 W) + 8 Kameras (PoE, 15,4 W) = 300 W + 123,2 W = **423,2 W** – ein Switch mit 370 W Budget reicht nicht.

## Einfach
Strom kann man sich wie **Wasser in einem Schlauch** vorstellen. Die **Spannung** ist der Wasserdruck, die **Stromstärke** ist, wie viel Wasser fließt. Die **Leistung** (Watt) ist Druck mal Menge – also wie viel Kraft das Wasser hat. Und die **Energie** (Kilowattstunden) ist, wie viel Wasser insgesamt durchgelaufen ist. Genau das bezahlst du beim Stromversorger.

Wenn ein Computer 100 Watt braucht und 10 Stunden läuft, hat er 1.000 Wattstunden = **1 Kilowattstunde** verbraucht. Kostet die Kilowattstunde 35 Cent, kostet dich das 35 Cent.

Eine **USV** ist ein **großer Akku**, der einspringt, wenn der Strom ausfällt. Es gibt einfache USVs, die erst umschalten, wenn der Strom weg ist (wie ein Ersatzspieler auf der Bank), und teure, die **immer** dazwischen sind und den Strom ständig sauber machen (wie ein Torwart, der immer im Tor steht). Für wichtige Server nimmt man die zweite Sorte.

Der Akku hält nicht ewig. Deshalb sagt die USV den Servern rechtzeitig: „Achtung, gleich ist der Akku leer – fahrt euch ordentlich herunter!“ So gehen keine Daten kaputt.

**PoE** ist ein Trick: Über dasselbe Netzwerkkabel, über das die Daten laufen, bekommt ein Gerät auch seinen **Strom**. Praktisch für Kameras oder WLAN-Antennen an der Decke, wo keine Steckdose ist. Aber der Switch hat nur eine bestimmte Menge Strom zu verteilen – wie ein Kuchen, der nur für eine bestimmte Anzahl Gäste reicht.

## Merksatz
- **P = U × I, W = P × t, U = R × I.**
- **Kosten = kW × h × €/kWh.**
- **VFD = Offline, VI = Line-Interactive, VFI = Online (Doppelwandler).**
- **USV: Watt UND VA prüfen, Reserve einplanen, Shutdown konfigurieren.**
- **PoE 15,4 – PoE+ 30 – PoE++ 60/90 W.**

## Prüfungsfalle
- **Watt in Kilowatt umrechnen** (÷ 1.000), bevor mit dem kWh-Preis gerechnet wird.
- Eine USV mit **1500 VA** liefert **nicht** 1500 W – entscheidend ist die Wirkleistung (PF beachten).
- Die rechnerische Überbrückungszeit ist ein **Idealwert**; Herstellerangaben/Laufzeitkurven verwenden.
- PoE-Leistung am **Switch** (PSE) ist höher als am **Endgerät** (PD) – Kabelverluste.
- Ohne **Shutdown-Konfiguration** schützt die USV nur kurz – bei langem Ausfall stürzen die Server trotzdem ab.

## Grafik
### Online-USV (VFI) im Normalbetrieb und bei Netzausfall
1. Netz -> Gleichrichter: Wechselspannung wird gleichgerichtet
2. Gleichrichter -> Batterie: Ladeerhaltung
3. Gleichrichter -> Wechselrichter: Gleichspannung
4. Wechselrichter -> Server: saubere Wechselspannung
5. Netz: Ausfall
6. Batterie -> Wechselrichter: Versorgung ohne Umschaltzeit
7. USV -> Server: Signal „Akku niedrig“ – kontrollierter Shutdown

### PoE-Budget prüfen
1. Planer: 10 APs × 30 W = 300 W
2. Planer: 8 Kameras × 15,4 W = 123,2 W
3. Planer: Summe 423,2 W
4. Switch: Budget 370 W – nicht ausreichend
5. Planer: Größeren Switch oder zweiten PoE-Switch wählen

## Lab
**Maschinen**: Hyper-V-Host **HV01** (Windows Server 2025) an einer USV mit Netzwerkkarte, Client **CL01** im Heimlabor **example.com**.

### GUI
1. **HV01**: Energieoptionen → Erweiterte Einstellungen → „Akku“ (nur bei USB-USV sichtbar) → Aktion bei kritischem Akkustand = Herunterfahren.
2. **HV01**: Bei Netzwerk-USV: Agent des Herstellers installieren, Shutdown-Verzögerung und Reihenfolge (erst VMs, dann Host) festlegen.
3. **CL01**: Weboberfläche der USV öffnen → Last (%), geschätzte Laufzeit und Batterietest-Ergebnis ablesen.
4. **CL01**: Stromkosten der Geräte in einer Tabelle berechnen (Leistung, Laufzeit, Preis).

### PowerShell
```powershell
# HV01 – Status einer per USB angeschlossenen USV (als Akku sichtbar)
Get-CimInstance -ClassName Win32_Battery | Select-Object Name, EstimatedChargeRemaining, EstimatedRunTime
# VMs bei Host-Shutdown sauber herunterfahren
Get-VM | Set-VM -AutomaticStopAction ShutDown

# CL01 – Stromkosten
$watt = 120; $stundenProTag = 8; $tage = 220; $preis = 0.35
$kwh = $watt / 1000 * $stundenProTag * $tage
'{0:N1} kWh, {1:N2} EUR' -f $kwh, ($kwh * $preis)
```

## Legende
### Scheinleistung und Wirkleistung
- Was: Scheinleistung S (VA) ist das Produkt aus Spannung und Strom, Wirkleistung P (W) der tatsächlich nutzbare Anteil.
- Wie: P = S × Leistungsfaktor (cos φ bzw. PF).
- Wann: Bei der Auswahl von USV, Generatoren und Netzteilen.
- Wo: Typenschild und Datenblatt (z. B. 1500 VA / 1350 W).
- Warum: Eine USV muss beide Grenzwerte einhalten, sonst Überlast.

### Shutdown-Konzept
- Was: Geplantes, automatisches Herunterfahren bei langem Stromausfall.
- Wie: USV meldet per USB/Netzwerk (SNMP, Agent) Akkustand; Server und VMs fahren in festgelegter Reihenfolge herunter.
- Wann: Wenn die Ausfalldauer die Überbrückungszeit übersteigen würde.
- Wo: Hypervisor, Server, Speichersysteme, Netzwerkgeräte.
- Warum: Verhindert Datenverlust und Dateisystemschäden.

## Karteikarten
- F: Wie lautet die Formel für die elektrische Leistung? | A: P = U × I (Leistung = Spannung × Stromstärke).
- F: Wie berechnet man die Energie? | A: W = P × t, z. B. 0,2 kW × 10 h = 2 kWh.
- F: Ein Gerät mit 250 W läuft 24/7. Wie viele kWh verbraucht es im Jahr? | A: 0,25 kW × 8.760 h = 2.190 kWh.
- F: Was ist der Unterschied zwischen VA und W? | A: VA = Scheinleistung, W = Wirkleistung; W = VA × Leistungsfaktor.
- F: Welche USV-Klasse arbeitet ohne Umschaltzeit? | A: VFI (Online/Doppelwandler).
- F: Wofür steht VFD? | A: Voltage and Frequency Dependent – Offline-/Standby-USV.
- F: Wie berechnet man die Überbrückungszeit vereinfacht? | A: t = Batterieenergie (Wh) × Wirkungsgrad ÷ Last (W).
- F: Welche Leistung liefert PoE+ (802.3at) am Switchport? | A: 30 W (25,5 W am Endgerät).
- F: Was ist PUE? | A: Power Usage Effectiveness = Gesamtenergie des Rechenzentrums ÷ Energie der IT-Geräte.
- F: Was bedeutet ein Netzteil-Wirkungsgrad von 90 %? | A: 90 % der aufgenommenen Leistung kommen bei den Komponenten an, 10 % werden zu Wärme.

## Quiz
? Ein PC nimmt 150 W auf und läuft 2.000 Stunden im Jahr. Strompreis 0,30 €/kWh. Wie hoch sind die Kosten?
* 90,00 €
- 900,00 €
- 9,00 €
- 45,00 €
! 0,15 kW × 2.000 h = 300 kWh × 0,30 € = 90 €.

? Welche USV-Bauart ist für ein Rechenzentrum mit empfindlichen Servern am besten geeignet?
* Online-USV (VFI, Doppelwandler)
- Offline-USV (VFD)
- Keine USV, nur Überspannungsschutz
- Line-Interactive ohne Akku
! Keine Umschaltzeit, ständige Aufbereitung der Spannung.

? Eine USV hat 2000 VA und einen Leistungsfaktor von 0,9. Wie viel Wirkleistung liefert sie?
* 1800 W
- 2000 W
- 2222 W
- 900 W
! P = S × PF = 2000 × 0,9.

? Welche Leistung stellt ein Switch je Port nach 802.3af (PoE) bereit?
* 15,4 W
- 30 W
- 60 W
- 90 W
! Am Endgerät kommen 12,95 W an.

? Batterie 240 Wh, Last 300 W, Wirkungsgrad 0,9. Wie lange überbrückt die USV theoretisch?
* ca. 43 Minuten
- ca. 80 Minuten
- ca. 20 Minuten
- ca. 4 Stunden
! 240 × 0,9 ÷ 300 = 0,72 h ≈ 43 min.

? Welche Formel beschreibt das ohmsche Gesetz?
* U = R × I
- P = U × I
- W = P × t
- S = P × cos φ
! P = U × I ist die Leistungsformel.

? Warum sollte eine USV mit dem Server kommunizieren?
* Damit der Server bei niedrigem Akkustand kontrolliert herunterfährt
- Damit die USV schneller lädt
- Damit der Server mehr Leistung bekommt
- Damit die Netzwerkverbindung schneller wird
! Ohne Shutdown-Signal stürzt der Server bei leerem Akku ab.

? Ein Switch hat ein PoE-Budget von 370 W. Wie viele PoE+-Geräte mit je 30 W können maximal versorgt werden?
* 12
- 13
- 24
- 10
! 370 ÷ 30 = 12,3 → 12 Geräte.

? Ein Rechenzentrum verbraucht 1.500 kW, die IT-Geräte davon 1.000 kW. Wie hoch ist der PUE?
* 1,5
- 0,67
- 2,5
- 500
! PUE = 1.500 ÷ 1.000.

## Lücken
- Die elektrische Leistung berechnet sich als P = U × {I}.
- 1 kWh entspricht {1.000|1000} Wh.
- Eine Online-USV wird nach DIN EN IEC 62040-3 als {VFI} klassifiziert.
- Wirkleistung = Scheinleistung × {Leistungsfaktor|cos φ|PF}.
- PoE+ nach 802.3at liefert am Switchport bis zu {30} W.

## Zuordnen
### USV-Klasse und Bauart
- VFD => Offline/Standby
- VI => Line-Interactive
- VFI => Online/Doppelwandler

### Größe und Einheit
- Spannung => Volt (V)
- Stromstärke => Ampere (A)
- Wirkleistung => Watt (W)
- Scheinleistung => Voltampere (VA)
- Energie => Kilowattstunde (kWh)

### PoE-Standard und Leistung am Switch
- 802.3af => 15,4 W
- 802.3at => 30 W
- 802.3bt Typ 3 => 60 W
- 802.3bt Typ 4 => 90 W

## Reihenfolge
### USV dimensionieren
1. Leistungsaufnahme aller Geräte ermitteln
2. Summe in W und VA bilden
3. Reserve von 20–30 % aufschlagen
4. USV-Klasse passend zum Schutzbedarf wählen
5. Überbrückungszeit anhand der Laufzeitkurve prüfen
6. Shutdown-Konzept einrichten und testen

### Jährliche Stromkosten berechnen
1. Leistung in kW umrechnen
2. Betriebsstunden pro Jahr ermitteln
3. Energie in kWh berechnen
4. Mit dem Preis je kWh multiplizieren

### Kontrollierter Shutdown bei Stromausfall
1. Netz fällt aus, USV übernimmt
2. USV meldet Batteriebetrieb an Server und Admin
3. Wartezeit läuft ab bzw. Akku erreicht Schwellwert
4. VMs werden heruntergefahren
5. Host und Speicher fahren herunter
6. USV schaltet die Ausgänge ab

## Freitext
- F: Berechnen Sie die jährlichen Stromkosten für 25 Arbeitsplätze mit je 90 W (PC) und 25 W (Monitor), 8 h/Tag an 220 Tagen, Preis 0,32 €/kWh. | M: 25 × 115 W = 2.875 W = 2,875 kW; × 8 × 220 = 5.060 kWh; × 0,32 € = 1.619,20 €. | P: 4
- F: Erläutern Sie den Unterschied zwischen einer Offline-USV (VFD) und einer Online-USV (VFI). | M: VFD: Last direkt am Netz, bei Ausfall Umschaltung auf Batterie (wenige ms), günstig, für Arbeitsplätze. VFI: Last ständig über Gleichrichter und Wechselrichter, keine Umschaltzeit, filtert alle Netzstörungen, teurer und geringerer Wirkungsgrad, für Server/RZ. | P: 4
- F: Ein Netzwerkschrank enthält zwei Server à 400 W, einen Switch mit 150 W und eine Firewall mit 50 W. Wählen Sie eine USV-Größe (W) mit 25 % Reserve. | M: Summe 1.000 W; × 1,25 = 1.250 W → USV mit mindestens 1.250 W Wirkleistung (z. B. 1.500 W / 1.650 VA). | P: 3

## Szenario
### Neuer Netzwerkschrank in der Außenstelle
In der Außenstelle stehen ein Server (350 W), ein Switch (120 W ohne PoE) und ein Router (30 W). Stromausfälle dauern dort bis zu 10 Minuten. Die IT-Leitung will eine USV.
- F: Welche Mindestwirkleistung benötigt die USV mit 25 % Reserve? | A: 500 W × 1,25 = 625 W. | P: 2
- F: Welche USV-Klasse und welche Zusatzfunktion empfehlen Sie? | A: Line-Interactive (VI) oder Online (VFI) je nach Budget/Netzqualität; Netzwerkkarte/Agent für automatischen Shutdown des Servers. | P: 2

### PoE-Kameras fallen aus
An einem PoE-Switch mit 185 W Budget hängen 4 Access Points (PoE+, je 30 W) und 6 Kameras (PoE, je 15,4 W). Zwei Kameras starten nicht.
- F: Erklären Sie die Ursache rechnerisch. | A: 120 W + 92,4 W = 212,4 W > 185 W Budget – der Switch versorgt nicht alle Ports. | P: 3
- F: Nennen Sie zwei Lösungen. | A: Switch mit größerem PoE-Budget, zweiter PoE-Switch, PoE-Injektoren, Portpriorität für wichtige Geräte. | P: 2

### Stromkosten im Serverraum senken
Im Serverraum laufen 6 alte Server mit je 450 W rund um die Uhr. Sie sollen durch 2 Virtualisierungshosts mit je 500 W ersetzt werden. Strompreis 0,30 €/kWh.
- F: Wie hoch ist die jährliche Einsparung? | A: Alt: 2,7 kW × 8.760 h = 23.652 kWh; neu: 1,0 kW × 8.760 h = 8.760 kWh; Differenz 14.892 kWh × 0,30 € = 4.467,60 €. | P: 4
- F: Welche weiteren Einsparungen entstehen? | A: Weniger Klimatisierung (Wärmelast), kleinere USV, weniger Platz und Wartung. | P: 2
